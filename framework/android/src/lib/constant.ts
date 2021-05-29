/* eslint no-shadow: "off" */

import NODE = android.lib.constant.CONTAINER_NODE;

export const enum BUILD_VERSION {
    R = 30,
    Q = 29,
    PIE = 28,
    OREO_1 = 27,
    OREO = 26,
    NOUGAT_1 = 25,
    NOUGAT = 24,
    MARSHMALLOW = 23,
    LOLLIPOP_1 = 22,
    LOLLIPOP = 21,
    KITKAT_1 = 20,
    KITKAT = 19,
    JELLYBEAN_2 = 18,
    JELLYBEAN_1 = 17,
    JELLYBEAN = 16,
    ICE_CREAM_SANDWICH_1 = 15,
    ICE_CREAM_SANDWICH = 14,
    ALL = 0,
    LATEST = 30
}

export enum CONTAINER_NODE {
    UNKNOWN,
    RADIO,
    CHECKBOX,
    SELECT,
    SVG,
    IMAGE,
    PROGRESS,
    RANGE,
    EDIT,
    BUTTON,
    TEXT,
    INLINE,
    LINE,
    SPACE,
    BLOCK,
    FRAME,
    LINEAR,
    GRID,
    RELATIVE,
    CONSTRAINT,
    WEBVIEW,
    VIDEOVIEW,
    FRAGMENT,
    GUIDELINE,
    BARRIER
}

export const SCREEN_DENSITY = {
    LDPI: 120,
    MDPI: 160,
    HDPI: 240,
    XHDPI: 320,
    XXHDPI: 480,
    XXXHDPI: 640
};

export const CONTAINER_ELEMENT = {
    PLAINTEXT: NODE.TEXT,
    HR: NODE.LINE,
    SVG: NODE.SVG,
    IMG: NODE.IMAGE,
    CANVAS: NODE.IMAGE,
    SELECT: NODE.SELECT,
    TEXTAREA: NODE.EDIT,
    METER: NODE.PROGRESS,
    PROGRESS: NODE.PROGRESS,
    AUDIO: NODE.VIDEOVIEW,
    VIDEO: NODE.VIDEOVIEW,
    IFRAME: NODE.WEBVIEW,
    INPUT_RANGE: NODE.RANGE,
    INPUT_TEXT: NODE.EDIT,
    INPUT_PASSWORD: NODE.EDIT,
    INPUT_NUMBER: NODE.EDIT,
    INPUT_EMAIL: NODE.EDIT,
    INPUT_SEARCH: NODE.EDIT,
    INPUT_URL: NODE.EDIT,
    INPUT_DATE: NODE.EDIT,
    INPUT_TEL: NODE.EDIT,
    INPUT_TIME: NODE.EDIT,
    INPUT_WEEK: NODE.EDIT,
    INPUT_MONTH: NODE.EDIT,
    INPUT_BUTTON: NODE.BUTTON,
    INPUT_FILE: NODE.BUTTON,
    INPUT_IMAGE: NODE.BUTTON,
    INPUT_COLOR: NODE.BUTTON,
    INPUT_SUBMIT: NODE.BUTTON,
    INPUT_RESET: NODE.BUTTON,
    INPUT_CHECKBOX: NODE.CHECKBOX,
    INPUT_RADIO: NODE.RADIO,
    'INPUT_DATETIME_LOCAL': NODE.EDIT
};

export const CONTAINER_TAGNAME = {
    RADIO: 'RadioButton',
    CHECKBOX: 'CheckBox',
    EDIT_LIST: 'AutoCompleteTextView',
    SELECT: 'Spinner',
    EDIT: 'EditText',
    SVG: 'ImageView',
    IMAGE: 'ImageView',
    BUTTON: 'Button',
    RANGE: 'SeekBar',
    METER: 'ProgressBar',
    PROGRESS: 'ProgressBar',
    TEXT: 'TextView',
    LINE: 'View',
    SPACE: 'Space',
    FRAME: 'FrameLayout',
    LINEAR: 'LinearLayout',
    GRID: 'android.widget.GridLayout',
    RELATIVE: 'RelativeLayout',
    WEBVIEW: 'WebView',
    VIDEOVIEW: 'VideoView',
    RADIOGROUP: 'RadioGroup',
    FRAGMENT: 'fragment',
    HORIZONTAL_SCROLL: 'HorizontalScrollView',
    VERTICAL_SCROLL: 'android.support.v4.widget.NestedScrollView',
    CONSTRAINT: 'android.support.constraint.ConstraintLayout',
    GUIDELINE: 'android.support.constraint.Guideline',
    BARRIER: 'android.support.constraint.Barrier'
};

export const CONTAINER_TAGNAME_X = {
    GRID: 'GridLayout',
    FRAGMENT: 'androidx.fragment.app.FragmentContainerView',
    VERTICAL_SCROLL: 'androidx.core.widget.NestedScrollView',
    CONSTRAINT: 'androidx.constraintlayout.widget.ConstraintLayout',
    GUIDELINE: 'androidx.constraintlayout.widget.Guideline',
    BARRIER: 'androidx.constraintlayout.widget.Barrier'
};

export const SUPPORT_TAGNAME = {
    NAVIGATION_VIEW: 'android.support.design.widget.NavigationView',
    COORDINATOR: 'android.support.design.widget.CoordinatorLayout',
    APPBAR: 'android.support.design.widget.AppBarLayout',
    COLLAPSING_TOOLBAR: 'android.support.design.widget.CollapsingToolbarLayout',
    FLOATING_ACTION_BUTTON: 'android.support.design.widget.FloatingActionButton',
    BOTTOM_NAVIGATION: 'android.support.design.widget.BottomNavigationView',
    DRAWER: 'android.support.v4.widget.DrawerLayout',
    TOOLBAR: 'android.support.v7.widget.Toolbar'
};

export const SUPPORT_TAGNAME_X = {
    NAVIGATION_VIEW: 'com.google.android.material.navigation.NavigationView',
    APPBAR: 'com.google.android.material.appbar.AppBarLayout',
    COLLAPSING_TOOLBAR: 'com.google.android.material.appbar.CollapsingToolbarLayout',
    FLOATING_ACTION_BUTTON: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
    BOTTOM_NAVIGATION: 'com.google.android.material.bottomnavigation.BottomNavigationView',
    SHAPEABLE_IMAGE_VIEW: 'com.google.android.material.imageview.ShapeableImageView',
	CARD_VIEW: 'androidx.cardview.widget.CardView',
	RECYCLER_VIEW: 'androidx.recyclerview.widget.RecyclerView',
    COORDINATOR: 'androidx.coordinatorlayout.widget.CoordinatorLayout',
    TOOLBAR: 'androidx.appcompat.widget.Toolbar',
    DRAWER: 'androidx.drawerlayout.widget.DrawerLayout'
};

export const DEPENDENCY_NAMESPACE: ObjectMap<[string, string, string]> = {
    'androidx.constraintlayout.widget': ['androidx.constraintlayout', 'constraintlayout', '2.0.4'],
    'androidx.core.widget': ['androidx.core', 'core', '1.5.0'],
    'androidx.appcompat.widget': ['androidx.appcompat', 'appcompat', '1.3.0'],
    'com.google.android.material': ['com.google.android.material', 'material', '1.3.0'],
    'android.support.constraint': ['android.support.constraint', 'constraint-layout', '2.0.4'],
    'android.support.design.widget': ['com.android.support', 'design', '28.0.0'],
    'android.support.v4.widget': ['com.android.support', 'support-v4', '28.0.0'],
    'android.support.v7.widget': ['com.android.support', 'appcompat-v7', '28.0.0'],
	'androidx.vectordrawable': ['androidx.vectordrawable', 'vectordrawable', '1.1.0']
};

export const DEPENDENCY_TAGNAME: ObjectMap<[string, string, string]> = {
	'GridLayout': ['androidx.gridlayout', 'gridlayout', '1.0.0'],
    [CONTAINER_TAGNAME.GRID]: ['com.android.support', 'gridlayout-v7', '28.0.0'],
	'fragment': ['com.android.support', 'support-fragment', '28.0.0'],
	[CONTAINER_TAGNAME_X.FRAGMENT]: ['androidx.fragment', 'fragment', '1.3.4'],
	[SUPPORT_TAGNAME_X.COORDINATOR]: ['androidx.coordinatorlayout', 'coordinatorlayout', '1.1.0'],
    [SUPPORT_TAGNAME_X.DRAWER]: ['androidx.appcompat', 'appcompat', '1.3.0'],
	[SUPPORT_TAGNAME_X.CARD_VIEW]: ['androidx.cardview', 'cardview', '1.0.0'],
	[SUPPORT_TAGNAME_X.RECYCLER_VIEW]: ['androidx.recyclerview', 'recyclerview', '1.2.0']
};

export const LAYOUT_MAP = {
    relativeParent: {
        left: 'layout_alignParentLeft',
        top: 'layout_alignParentTop',
        right: 'layout_alignParentRight',
        bottom: 'layout_alignParentBottom',
        centerHorizontal: 'layout_centerHorizontal',
        centerVertical: 'layout_centerVertical'
    },
    relative: {
        left: 'layout_alignLeft',
        top: 'layout_alignTop',
        right: 'layout_alignRight',
        bottom: 'layout_alignBottom',
        baseline: 'layout_alignBaseline',
        leftRight: 'layout_toRightOf',
        rightLeft: 'layout_toLeftOf',
        topBottom: 'layout_below',
        bottomTop: 'layout_above'
    },
    constraint: {
        left: 'layout_constraintLeft_toLeftOf',
        top: 'layout_constraintTop_toTopOf',
        right: 'layout_constraintRight_toRightOf',
        bottom: 'layout_constraintBottom_toBottomOf',
        leftRight: 'layout_constraintLeft_toRightOf',
        rightLeft: 'layout_constraintRight_toLeftOf',
        baseline: 'layout_constraintBaseline_toBaselineOf',
        topBottom: 'layout_constraintTop_toBottomOf',
        bottomTop: 'layout_constraintBottom_toTopOf'
    }
};

export const LOCALIZE_MAP = {
    left: 'start',
    right: 'end',
    paddingLeft: 'paddingStart',
    paddingRight: 'paddingEnd',
    layout_marginLeft: 'layout_marginStart',
    layout_marginRight: 'layout_marginEnd',
    layout_alignParentLeft: 'layout_alignParentStart',
    layout_alignParentRight: 'layout_alignParentEnd',
    layout_alignLeft: 'layout_alignStart',
    layout_alignRight: 'layout_alignEnd',
    layout_toLeftOf: 'layout_toStartOf',
    layout_toRightOf: 'layout_toEndOf',
    layout_constraintLeft_toLeftOf: 'layout_constraintStart_toStartOf',
    layout_constraintRight_toRightOf: 'layout_constraintEnd_toEndOf',
    layout_constraintLeft_toRightOf: 'layout_constraintStart_toEndOf',
    layout_constraintRight_toLeftOf: 'layout_constraintEnd_toStartOf'
};

export const XML_NAMESPACE = {
    android: 'http://schemas.android.com/apk/res/android',
    app: 'http://schemas.android.com/apk/res-auto',
    aapt: 'http://schemas.android.com/aapt'
};

export const RESERVED_JAVA = [
    '_',
    'abstract',
    'assert',
    'boolean',
    'break',
    'byte',
    'case',
    'catch',
    'char',
    'class',
    'const',
    'continue',
    'default',
    'double',
    'do',
    'else',
    'enum',
    'extends',
    'false',
    'final',
    'finally',
    'float',
    'for',
    'goto',
    'if',
    'implements',
    'import',
    'instanceof',
    'int',
    'interface',
    'long',
    'native',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'short',
    'static',
    'strictfp',
    'super',
    'switch',
    'synchronized',
    'this',
    'throw',
    'throws',
    'transient',
    'true',
    'try',
    'void',
    'volatile',
    'while'
];

export const FONT_GOOGLE: FontProviderFonts = {
	"ABeeZee": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Abel": {
		"normal": ["400"]
	},
	"Abhaya Libre": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Abril Fatface": {
		"normal": ["400"]
	},
	"Aclonica": {
		"normal": ["400"]
	},
	"Acme": {
		"normal": ["400"]
	},
	"Actor": {
		"normal": ["400"]
	},
	"Adamina": {
		"normal": ["400"]
	},
	"Advent Pro": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Aguafina Script": {
		"normal": ["400"]
	},
	"Akaya Kanadaka": {
		"normal": ["400"]
	},
	"Akaya Telivigala": {
		"normal": ["400"]
	},
	"Akronim": {
		"normal": ["400"]
	},
	"Aladin": {
		"normal": ["400"]
	},
	"Alata": {
		"normal": ["400"]
	},
	"Alatsi": {
		"normal": ["400"]
	},
	"Aldrich": {
		"normal": ["400"]
	},
	"Alef": {
		"normal": ["400", "700"]
	},
	"Alegreya": {
		"normal": ["400", "500", "600", "700", "800", "900"],
		"italic": ["400", "500", "600", "700", "800", "900"]
	},
	"Alegreya SC": {
		"normal": ["400", "500", "700", "800", "900"],
		"italic": ["400", "500", "700", "800", "900"]
	},
	"Alegreya Sans": {
		"normal": ["100", "300", "400", "500", "700", "800", "900"],
		"italic": ["100", "300", "400", "500", "700", "800", "900"]
	},
	"Alegreya Sans SC": {
		"normal": ["100", "300", "400", "500", "700", "800", "900"],
		"italic": ["100", "300", "400", "500", "700", "800", "900"]
	},
	"Aleo": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Alex Brush": {
		"normal": ["400"]
	},
	"Alfa Slab One": {
		"normal": ["400"]
	},
	"Alice": {
		"normal": ["400"]
	},
	"Alike": {
		"normal": ["400"]
	},
	"Alike Angular": {
		"normal": ["400"]
	},
	"Allan": {
		"normal": ["400", "700"]
	},
	"Allerta": {
		"normal": ["400"]
	},
	"Allerta Stencil": {
		"normal": ["400"]
	},
	"Allura": {
		"normal": ["400"]
	},
	"Almarai": {
		"normal": ["300", "400", "700", "800"]
	},
	"Almendra": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Almendra Display": {
		"normal": ["400"]
	},
	"Almendra SC": {
		"normal": ["400"]
	},
	"Amarante": {
		"normal": ["400"]
	},
	"Amaranth": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Amatic SC": {
		"normal": ["400", "700"]
	},
	"Amethysta": {
		"normal": ["400"]
	},
	"Amiko": {
		"normal": ["400", "600", "700"]
	},
	"Amiri": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Amita": {
		"normal": ["400", "700"]
	},
	"Anaheim": {
		"normal": ["400"]
	},
	"Andada": {
		"normal": ["400"]
	},
	"Andika": {
		"normal": ["400"]
	},
	"Andika New Basic": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Angkor": {
		"normal": ["400"]
	},
	"Annie Use Your Telescope": {
		"normal": ["400"]
	},
	"Anonymous Pro": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Antic": {
		"normal": ["400"]
	},
	"Antic Didone": {
		"normal": ["400"]
	},
	"Antic Slab": {
		"normal": ["400"]
	},
	"Anton": {
		"normal": ["400"]
	},
	"Antonio": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Arapey": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Arbutus": {
		"normal": ["400"]
	},
	"Arbutus Slab": {
		"normal": ["400"]
	},
	"Architects Daughter": {
		"normal": ["400"]
	},
	"Archivo": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Archivo Black": {
		"normal": ["400"]
	},
	"Archivo Narrow": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Aref Ruqaa": {
		"normal": ["400", "700"]
	},
	"Arima Madurai": {
		"normal": ["100", "200", "300", "400", "500", "700", "800", "900"]
	},
	"Arimo": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Arizonia": {
		"normal": ["400"]
	},
	"Armata": {
		"normal": ["400"]
	},
	"Arsenal": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Artifika": {
		"normal": ["400"]
	},
	"Arvo": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Arya": {
		"normal": ["400", "700"]
	},
	"Asap": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Asap Condensed": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"],
		"width": "75"
	},
	"Asar": {
		"normal": ["400"]
	},
	"Asset": {
		"normal": ["400"]
	},
	"Assistant": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Astloch": {
		"normal": ["400", "700"]
	},
	"Asul": {
		"normal": ["400", "700"]
	},
	"Athiti": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Atma": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Atomic Age": {
		"normal": ["400"]
	},
	"Aubrey": {
		"normal": ["400"]
	},
	"Audiowide": {
		"normal": ["400"]
	},
	"Autour One": {
		"normal": ["400"]
	},
	"Average": {
		"normal": ["400"]
	},
	"Average Sans": {
		"normal": ["400"]
	},
	"Averia Gruesa Libre": {
		"normal": ["400"]
	},
	"Averia Libre": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Averia Sans Libre": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Averia Serif Libre": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"B612": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"B612 Mono": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Bad Script": {
		"normal": ["400"]
	},
	"Bahiana": {
		"normal": ["400"]
	},
	"Bahianita": {
		"normal": ["400"]
	},
	"Bai Jamjuree": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Ballet": {
		"normal": ["400"]
	},
	"Baloo 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Bhai 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Bhaina 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Chettan 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Da 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Paaji 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Tamma 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Tammudu 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Baloo Thambi 2": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Balsamiq Sans": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Balthazar": {
		"normal": ["400"]
	},
	"Bangers": {
		"normal": ["400"]
	},
	"Barlow": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Barlow Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Barlow Semi Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Barriecito": {
		"normal": ["400"]
	},
	"Barrio": {
		"normal": ["400"]
	},
	"Basic": {
		"normal": ["400"]
	},
	"Baskervville": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Battambang": {
		"normal": ["400", "700"]
	},
	"Baumans": {
		"normal": ["400"]
	},
	"Bayon": {
		"normal": ["400"]
	},
	"Be Vietnam": {
		"normal": ["100", "300", "400", "500", "600", "700", "800"],
		"italic": ["100", "300", "400", "500", "600", "700", "800"]
	},
	"Bebas Neue": {
		"normal": ["400"]
	},
	"Belgrano": {
		"normal": ["400"]
	},
	"Bellefair": {
		"normal": ["400"]
	},
	"Belleza": {
		"normal": ["400"]
	},
	"Bellota": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Bellota Text": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"BenchNine": {
		"normal": ["300", "400", "700"]
	},
	"Benne": {
		"normal": ["400"]
	},
	"Bentham": {
		"normal": ["400"]
	},
	"Berkshire Swash": {
		"normal": ["400"]
	},
	"Beth Ellen": {
		"normal": ["400"]
	},
	"Bevan": {
		"normal": ["400"]
	},
	"Big Shoulders Display": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Big Shoulders Inline Display": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Big Shoulders Inline Text": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Big Shoulders Stencil Display": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Big Shoulders Stencil Text": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Big Shoulders Text": {
		"normal": ["100", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Bigelow Rules": {
		"normal": ["400"]
	},
	"Bigshot One": {
		"normal": ["400"]
	},
	"Bilbo": {
		"normal": ["400"]
	},
	"Bilbo Swash Caps": {
		"normal": ["400"]
	},
	"BioRhyme": {
		"normal": ["200", "300", "400", "700", "800"]
	},
	"BioRhyme Expanded": {
		"normal": ["200", "300", "400", "700", "800"],
		"width": "125"
	},
	"Biryani": {
		"normal": ["200", "300", "400", "600", "700", "800", "900"]
	},
	"Bitter": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Black And White Picture": {
		"normal": ["400"]
	},
	"Black Han Sans": {
		"normal": ["400"]
	},
	"Black Ops One": {
		"normal": ["400"]
	},
	"Blinker": {
		"normal": ["100", "200", "300", "400", "600", "700", "800", "900"]
	},
	"Bodoni Moda": {
		"normal": ["400", "500", "600", "700", "800", "900"],
		"italic": ["400", "500", "600", "700", "800", "900"]
	},
	"Bokor": {
		"normal": ["400"]
	},
	"Bonbon": {
		"normal": ["400"]
	},
	"Boogaloo": {
		"normal": ["400"]
	},
	"Bowlby One": {
		"normal": ["400"]
	},
	"Bowlby One SC": {
		"normal": ["400"]
	},
	"Brawler": {
		"normal": ["400"]
	},
	"Bree Serif": {
		"normal": ["400"]
	},
	"Brygada 1918": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Bubblegum Sans": {
		"normal": ["400"]
	},
	"Bubbler One": {
		"normal": ["400"]
	},
	"Buda": {
		"normal": ["300"]
	},
	"Buenard": {
		"normal": ["400", "700"]
	},
	"Bungee": {
		"normal": ["400"]
	},
	"Bungee Hairline": {
		"normal": ["400"]
	},
	"Bungee Inline": {
		"normal": ["400"]
	},
	"Bungee Outline": {
		"normal": ["400"]
	},
	"Bungee Shade": {
		"normal": ["400"]
	},
	"Butcherman": {
		"normal": ["400"]
	},
	"Butterfly Kids": {
		"normal": ["400"]
	},
	"Cabin": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Cabin Condensed": {
		"normal": ["400", "500", "600", "700"],
		"width": "75"
	},
	"Cabin Sketch": {
		"normal": ["400", "700"]
	},
	"Caesar Dressing": {
		"normal": ["400"]
	},
	"Cagliostro": {
		"normal": ["400"]
	},
	"Cairo": {
		"normal": ["200", "300", "400", "600", "700", "900"]
	},
	"Caladea": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Calistoga": {
		"normal": ["400"]
	},
	"Calligraffitti": {
		"normal": ["400"]
	},
	"Cambay": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Cambo": {
		"normal": ["400"]
	},
	"Candal": {
		"normal": ["400"]
	},
	"Cantarell": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Cantata One": {
		"normal": ["400"]
	},
	"Cantora One": {
		"normal": ["400"]
	},
	"Capriola": {
		"normal": ["400"]
	},
	"Cardo": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Carme": {
		"normal": ["400"]
	},
	"Carrois Gothic": {
		"normal": ["400"]
	},
	"Carrois Gothic SC": {
		"normal": ["400"]
	},
	"Carter One": {
		"normal": ["400"]
	},
	"Castoro": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Catamaran": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Caudex": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Caveat": {
		"normal": ["400", "500", "600", "700"]
	},
	"Caveat Brush": {
		"normal": ["400"]
	},
	"Cedarville Cursive": {
		"normal": ["400"]
	},
	"Ceviche One": {
		"normal": ["400"]
	},
	"Chakra Petch": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Changa": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Changa One": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Chango": {
		"normal": ["400"]
	},
	"Charm": {
		"normal": ["400", "700"]
	},
	"Charmonman": {
		"normal": ["400", "700"]
	},
	"Chathura": {
		"normal": ["100", "300", "400", "700", "800"]
	},
	"Chau Philomene One": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Chela One": {
		"normal": ["400"]
	},
	"Chelsea Market": {
		"normal": ["400"]
	},
	"Chenla": {
		"normal": ["400"]
	},
	"Cherry Cream Soda": {
		"normal": ["400"]
	},
	"Cherry Swash": {
		"normal": ["400", "700"]
	},
	"Chewy": {
		"normal": ["400"]
	},
	"Chicle": {
		"normal": ["400"]
	},
	"Chilanka": {
		"normal": ["400"]
	},
	"Chivo": {
		"normal": ["300", "400", "700", "900"],
		"italic": ["300", "400", "700", "900"]
	},
	"Chonburi": {
		"normal": ["400"]
	},
	"Cinzel": {
		"normal": ["400", "500", "600", "700", "800", "900"]
	},
	"Cinzel Decorative": {
		"normal": ["400", "700", "900"]
	},
	"Clicker Script": {
		"normal": ["400"]
	},
	"Coda": {
		"normal": ["400", "800"]
	},
	"Coda Caption": {
		"normal": ["800"]
	},
	"Codystar": {
		"normal": ["300", "400"]
	},
	"Coiny": {
		"normal": ["400"]
	},
	"Combo": {
		"normal": ["400"]
	},
	"Comfortaa": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Comic Neue": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Coming Soon": {
		"normal": ["400"]
	},
	"Commissioner": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Concert One": {
		"normal": ["400"]
	},
	"Condiment": {
		"normal": ["400"]
	},
	"Content": {
		"normal": ["400", "700"]
	},
	"Contrail One": {
		"normal": ["400"]
	},
	"Convergence": {
		"normal": ["400"]
	},
	"Cookie": {
		"normal": ["400"]
	},
	"Copse": {
		"normal": ["400"]
	},
	"Corben": {
		"normal": ["400", "700"]
	},
	"Cormorant": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Cormorant Garamond": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Cormorant Infant": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Cormorant SC": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Cormorant Unicase": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Cormorant Upright": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Courgette": {
		"normal": ["400"]
	},
	"Courier Prime": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Cousine": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Coustard": {
		"normal": ["400", "900"]
	},
	"Covered By Your Grace": {
		"normal": ["400"]
	},
	"Crafty Girls": {
		"normal": ["400"]
	},
	"Creepster": {
		"normal": ["400"]
	},
	"Crete Round": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Crimson Pro": {
		"normal": ["200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Crimson Text": {
		"normal": ["400", "600", "700"],
		"italic": ["400", "600", "700"]
	},
	"Croissant One": {
		"normal": ["400"]
	},
	"Crushed": {
		"normal": ["400"]
	},
	"Cuprum": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Cute Font": {
		"normal": ["400"]
	},
	"Cutive": {
		"normal": ["400"]
	},
	"Cutive Mono": {
		"normal": ["400"]
	},
	"DM Mono": {
		"normal": ["300", "400", "500"],
		"italic": ["300", "400", "500"]
	},
	"DM Sans": {
		"normal": ["400", "500", "700"],
		"italic": ["400", "500", "700"]
	},
	"DM Serif Display": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"DM Serif Text": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Damion": {
		"normal": ["400"]
	},
	"Dancing Script": {
		"normal": ["400", "500", "600", "700"]
	},
	"Dangrek": {
		"normal": ["400"]
	},
	"Darker Grotesque": {
		"normal": ["300", "400", "500", "600", "700", "800", "900"]
	},
	"David Libre": {
		"normal": ["400", "500", "700"]
	},
	"Dawning of a New Day": {
		"normal": ["400"]
	},
	"Days One": {
		"normal": ["400"]
	},
	"Dekko": {
		"normal": ["400"]
	},
	"Dela Gothic One": {
		"normal": ["400"]
	},
	"Delius": {
		"normal": ["400"]
	},
	"Delius Swash Caps": {
		"normal": ["400"]
	},
	"Delius Unicase": {
		"normal": ["400", "700"]
	},
	"Della Respira": {
		"normal": ["400"]
	},
	"Denk One": {
		"normal": ["400"]
	},
	"Devonshire": {
		"normal": ["400"]
	},
	"Dhurjati": {
		"normal": ["400"]
	},
	"Didact Gothic": {
		"normal": ["400"]
	},
	"Diplomata": {
		"normal": ["400"]
	},
	"Diplomata SC": {
		"normal": ["400"]
	},
	"Do Hyeon": {
		"normal": ["400"]
	},
	"Dokdo": {
		"normal": ["400"]
	},
	"Domine": {
		"normal": ["400", "500", "600", "700"]
	},
	"Donegal One": {
		"normal": ["400"]
	},
	"Doppio One": {
		"normal": ["400"]
	},
	"Dorsa": {
		"normal": ["400"]
	},
	"Dosis": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"DotGothic16": {
		"normal": ["400"]
	},
	"Dr Sugiyama": {
		"normal": ["400"]
	},
	"Duru Sans": {
		"normal": ["400"]
	},
	"Dynalight": {
		"normal": ["400"]
	},
	"EB Garamond": {
		"normal": ["400", "500", "600", "700", "800"],
		"italic": ["400", "500", "600", "700", "800"]
	},
	"Eagle Lake": {
		"normal": ["400"]
	},
	"East Sea Dokdo": {
		"normal": ["400"]
	},
	"Eater": {
		"normal": ["400"]
	},
	"Economica": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Eczar": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"El Messiri": {
		"normal": ["400", "500", "600", "700"]
	},
	"Electrolize": {
		"normal": ["400"]
	},
	"Elsie": {
		"normal": ["400", "900"]
	},
	"Elsie Swash Caps": {
		"normal": ["400", "900"]
	},
	"Emblema One": {
		"normal": ["400"]
	},
	"Emilys Candy": {
		"normal": ["400"]
	},
	"Encode Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Encode Sans Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Encode Sans Expanded": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "125"
	},
	"Encode Sans Semi Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Encode Sans Semi Expanded": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "125"
	},
	"Engagement": {
		"normal": ["400"]
	},
	"Englebert": {
		"normal": ["400"]
	},
	"Enriqueta": {
		"normal": ["400", "500", "600", "700"]
	},
	"Epilogue": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Erica One": {
		"normal": ["400"]
	},
	"Esteban": {
		"normal": ["400"]
	},
	"Euphoria Script": {
		"normal": ["400"]
	},
	"Ewert": {
		"normal": ["400"]
	},
	"Exo": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Exo 2": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Expletus Sans": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Fahkwang": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Fanwood Text": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Farro": {
		"normal": ["300", "400", "500", "700"]
	},
	"Farsan": {
		"normal": ["400"]
	},
	"Fascinate": {
		"normal": ["400"]
	},
	"Fascinate Inline": {
		"normal": ["400"]
	},
	"Faster One": {
		"normal": ["400"]
	},
	"Fasthand": {
		"normal": ["400"]
	},
	"Fauna One": {
		"normal": ["400"]
	},
	"Faustina": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Federant": {
		"normal": ["400"]
	},
	"Federo": {
		"normal": ["400"]
	},
	"Felipa": {
		"normal": ["400"]
	},
	"Fenix": {
		"normal": ["400"]
	},
	"Finger Paint": {
		"normal": ["400"]
	},
	"Fira Code": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Fira Mono": {
		"normal": ["400", "500", "700"]
	},
	"Fira Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Fira Sans Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Fira Sans Extra Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Fjalla One": {
		"normal": ["400"]
	},
	"Fjord One": {
		"normal": ["400"]
	},
	"Flamenco": {
		"normal": ["300", "400"]
	},
	"Flavors": {
		"normal": ["400"]
	},
	"Fondamento": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Fontdiner Swanky": {
		"normal": ["400"]
	},
	"Forum": {
		"normal": ["400"]
	},
	"Francois One": {
		"normal": ["400"]
	},
	"Frank Ruhl Libre": {
		"normal": ["300", "400", "500", "700", "900"]
	},
	"Fraunces": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Freckle Face": {
		"normal": ["400"]
	},
	"Fredericka the Great": {
		"normal": ["400"]
	},
	"Fredoka One": {
		"normal": ["400"]
	},
	"Freehand": {
		"normal": ["400"]
	},
	"Fresca": {
		"normal": ["400"]
	},
	"Frijole": {
		"normal": ["400"]
	},
	"Fruktur": {
		"normal": ["400"]
	},
	"Fugaz One": {
		"normal": ["400"]
	},
	"GFS Didot": {
		"normal": ["400"]
	},
	"GFS Neohellenic": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Gabriela": {
		"normal": ["400"]
	},
	"Gaegu": {
		"normal": ["300", "400", "700"]
	},
	"Gafata": {
		"normal": ["400"]
	},
	"Galada": {
		"normal": ["400"]
	},
	"Galdeano": {
		"normal": ["400"]
	},
	"Galindo": {
		"normal": ["400"]
	},
	"Gamja Flower": {
		"normal": ["400"]
	},
	"Gayathri": {
		"normal": ["100", "400", "700"]
	},
	"Gelasio": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Gentium Basic": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Gentium Book Basic": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Geo": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Geostar": {
		"normal": ["400"]
	},
	"Geostar Fill": {
		"normal": ["400"]
	},
	"Germania One": {
		"normal": ["400"]
	},
	"Gidugu": {
		"normal": ["400"]
	},
	"Gilda Display": {
		"normal": ["400"]
	},
	"Girassol": {
		"normal": ["400"]
	},
	"Give You Glory": {
		"normal": ["400"]
	},
	"Glass Antiqua": {
		"normal": ["400"]
	},
	"Glegoo": {
		"normal": ["400", "700"]
	},
	"Gloria Hallelujah": {
		"normal": ["400"]
	},
	"Goblin One": {
		"normal": ["400"]
	},
	"Gochi Hand": {
		"normal": ["400"]
	},
	"Goldman": {
		"normal": ["400", "700"]
	},
	"Gorditas": {
		"normal": ["400", "700"]
	},
	"Gothic A1": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Gotu": {
		"normal": ["400"]
	},
	"Goudy Bookletter 1911": {
		"normal": ["400"]
	},
	"Graduate": {
		"normal": ["400"]
	},
	"Grand Hotel": {
		"normal": ["400"]
	},
	"Grandstander": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Gravitas One": {
		"normal": ["400"]
	},
	"Great Vibes": {
		"normal": ["400"]
	},
	"Grenze": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Grenze Gotisch": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Griffy": {
		"normal": ["400"]
	},
	"Gruppo": {
		"normal": ["400"]
	},
	"Gudea": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Gugi": {
		"normal": ["400"]
	},
	"Gupter": {
		"normal": ["400", "500", "700"]
	},
	"Gurajada": {
		"normal": ["400"]
	},
	"Habibi": {
		"normal": ["400"]
	},
	"Hachi Maru Pop": {
		"normal": ["400"]
	},
	"Halant": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Hammersmith One": {
		"normal": ["400"]
	},
	"Hanalei": {
		"normal": ["400"]
	},
	"Hanalei Fill": {
		"normal": ["400"]
	},
	"Handlee": {
		"normal": ["400"]
	},
	"Hanuman": {
		"normal": ["400", "700"]
	},
	"Happy Monkey": {
		"normal": ["400"]
	},
	"Harmattan": {
		"normal": ["400", "700"]
	},
	"Headland One": {
		"normal": ["400"]
	},
	"Heebo": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Henny Penny": {
		"normal": ["400"]
	},
	"Hepta Slab": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Herr Von Muellerhoff": {
		"normal": ["400"]
	},
	"Hi Melody": {
		"normal": ["400"]
	},
	"Hind": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Hind Guntur": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Hind Madurai": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Hind Siliguri": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Hind Vadodara": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Holtwood One SC": {
		"normal": ["400"]
	},
	"Homemade Apple": {
		"normal": ["400"]
	},
	"Homenaje": {
		"normal": ["400"]
	},
	"IBM Plex Mono": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"IBM Plex Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"IBM Plex Sans Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"],
		"width": "75"
	},
	"IBM Plex Serif": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"IM Fell DW Pica": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"IM Fell DW Pica SC": {
		"normal": ["400"]
	},
	"IM Fell Double Pica": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"IM Fell Double Pica SC": {
		"normal": ["400"]
	},
	"IM Fell English": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"IM Fell English SC": {
		"normal": ["400"]
	},
	"IM Fell French Canon": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"IM Fell French Canon SC": {
		"normal": ["400"]
	},
	"IM Fell Great Primer": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"IM Fell Great Primer SC": {
		"normal": ["400"]
	},
	"Ibarra Real Nova": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Iceberg": {
		"normal": ["400"]
	},
	"Iceland": {
		"normal": ["400"]
	},
	"Imbue": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Imprima": {
		"normal": ["400"]
	},
	"Inconsolata": {
		"normal": ["200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Inder": {
		"normal": ["400"]
	},
	"Indie Flower": {
		"normal": ["400"]
	},
	"Inika": {
		"normal": ["400", "700"]
	},
	"Inknut Antiqua": {
		"normal": ["300", "400", "500", "600", "700", "800", "900"]
	},
	"Inria Sans": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Inria Serif": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"]
	},
	"Inter": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Irish Grover": {
		"normal": ["400"]
	},
	"Istok Web": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Italiana": {
		"normal": ["400"]
	},
	"Italianno": {
		"normal": ["400"]
	},
	"Itim": {
		"normal": ["400"]
	},
	"Jacques Francois": {
		"normal": ["400"]
	},
	"Jacques Francois Shadow": {
		"normal": ["400"]
	},
	"Jaldi": {
		"normal": ["400", "700"]
	},
	"JetBrains Mono": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800"]
	},
	"Jim Nightshade": {
		"normal": ["400"]
	},
	"Jockey One": {
		"normal": ["400"]
	},
	"Jolly Lodger": {
		"normal": ["400"]
	},
	"Jomhuria": {
		"normal": ["400"]
	},
	"Jomolhari": {
		"normal": ["400"]
	},
	"Josefin Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Josefin Slab": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Jost": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Joti One": {
		"normal": ["400"]
	},
	"Jua": {
		"normal": ["400"]
	},
	"Judson": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Julee": {
		"normal": ["400"]
	},
	"Julius Sans One": {
		"normal": ["400"]
	},
	"Junge": {
		"normal": ["400"]
	},
	"Jura": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Just Another Hand": {
		"normal": ["400"]
	},
	"Just Me Again Down Here": {
		"normal": ["400"]
	},
	"K2D": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800"]
	},
	"Kadwa": {
		"normal": ["400", "700"]
	},
	"Kalam": {
		"normal": ["300", "400", "700"]
	},
	"Kameron": {
		"normal": ["400", "700"]
	},
	"Kanit": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Kantumruy": {
		"normal": ["300", "400", "700"]
	},
	"Karantina": {
		"normal": ["300", "400", "700"]
	},
	"Karla": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"],
		"italic": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Karma": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Katibeh": {
		"normal": ["400"]
	},
	"Kaushan Script": {
		"normal": ["400"]
	},
	"Kavivanar": {
		"normal": ["400"]
	},
	"Kavoon": {
		"normal": ["400"]
	},
	"Kdam Thmor": {
		"normal": ["400"]
	},
	"Keania One": {
		"normal": ["400"]
	},
	"Kelly Slab": {
		"normal": ["400"]
	},
	"Kenia": {
		"normal": ["400"]
	},
	"Khand": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Khmer": {
		"normal": ["400"]
	},
	"Khula": {
		"normal": ["300", "400", "600", "700", "800"]
	},
	"Kirang Haerang": {
		"normal": ["400"]
	},
	"Kite One": {
		"normal": ["400"]
	},
	"Kiwi Maru": {
		"normal": ["300", "400", "500"]
	},
	"Knewave": {
		"normal": ["400"]
	},
	"KoHo": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Kodchasan": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Kosugi": {
		"normal": ["400"]
	},
	"Kosugi Maru": {
		"normal": ["400"]
	},
	"Kotta One": {
		"normal": ["400"]
	},
	"Koulen": {
		"normal": ["400"]
	},
	"Kranky": {
		"normal": ["400"]
	},
	"Kreon": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Kristi": {
		"normal": ["400"]
	},
	"Krona One": {
		"normal": ["400"]
	},
	"Krub": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Kufam": {
		"normal": ["400", "500", "600", "700", "800", "900"],
		"italic": ["400", "500", "600", "700", "800", "900"]
	},
	"Kulim Park": {
		"normal": ["200", "300", "400", "600", "700"],
		"italic": ["200", "300", "400", "600", "700"]
	},
	"Kumar One": {
		"normal": ["400"]
	},
	"Kumar One Outline": {
		"normal": ["400"]
	},
	"Kumbh Sans": {
		"normal": ["300", "400", "700"]
	},
	"Kurale": {
		"normal": ["400"]
	},
	"La Belle Aurore": {
		"normal": ["400"]
	},
	"Lacquer": {
		"normal": ["400"]
	},
	"Laila": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Lakki Reddy": {
		"normal": ["400"]
	},
	"Lalezar": {
		"normal": ["400"]
	},
	"Lancelot": {
		"normal": ["400"]
	},
	"Langar": {
		"normal": ["400"]
	},
	"Lateef": {
		"normal": ["400"]
	},
	"Lato": {
		"normal": ["100", "300", "400", "700", "900"],
		"italic": ["100", "300", "400", "700", "900"]
	},
	"League Script": {
		"normal": ["400"]
	},
	"Leckerli One": {
		"normal": ["400"]
	},
	"Ledger": {
		"normal": ["400"]
	},
	"Lekton": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Lemon": {
		"normal": ["400"]
	},
	"Lemonada": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Lexend": {
		"normal": ["100", "300", "400", "500", "600", "700", "800"]
	},
	"Lexend Deca": {
		"normal": ["400"]
	},
	"Lexend Exa": {
		"normal": ["400"]
	},
	"Lexend Giga": {
		"normal": ["400"]
	},
	"Lexend Mega": {
		"normal": ["400"]
	},
	"Lexend Peta": {
		"normal": ["400"]
	},
	"Lexend Tera": {
		"normal": ["400"]
	},
	"Lexend Zetta": {
		"normal": ["400"]
	},
	"Libre Barcode 128": {
		"normal": ["400"]
	},
	"Libre Barcode 128 Text": {
		"normal": ["400"]
	},
	"Libre Barcode 39": {
		"normal": ["400"]
	},
	"Libre Barcode 39 Extended": {
		"normal": ["400"]
	},
	"Libre Barcode 39 Extended Text": {
		"normal": ["400"]
	},
	"Libre Barcode 39 Text": {
		"normal": ["400"]
	},
	"Libre Barcode EAN13 Text": {
		"normal": ["400"]
	},
	"Libre Baskerville": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Libre Caslon Display": {
		"normal": ["400"]
	},
	"Libre Caslon Text": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Libre Franklin": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Life Savers": {
		"normal": ["400", "700", "800"]
	},
	"Lilita One": {
		"normal": ["400"]
	},
	"Lily Script One": {
		"normal": ["400"]
	},
	"Limelight": {
		"normal": ["400"]
	},
	"Linden Hill": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Literata": {
		"normal": ["200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Liu Jian Mao Cao": {
		"normal": ["400"]
	},
	"Livvic": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "900"]
	},
	"Lobster": {
		"normal": ["400"]
	},
	"Lobster Two": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Londrina Outline": {
		"normal": ["400"]
	},
	"Londrina Shadow": {
		"normal": ["400"]
	},
	"Londrina Sketch": {
		"normal": ["400"]
	},
	"Londrina Solid": {
		"normal": ["100", "300", "400", "900"]
	},
	"Long Cang": {
		"normal": ["400"]
	},
	"Lora": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Love Ya Like A Sister": {
		"normal": ["400"]
	},
	"Loved by the King": {
		"normal": ["400"]
	},
	"Lovers Quarrel": {
		"normal": ["400"]
	},
	"Luckiest Guy": {
		"normal": ["400"]
	},
	"Lusitana": {
		"normal": ["400", "700"]
	},
	"Lustria": {
		"normal": ["400"]
	},
	"M PLUS 1p": {
		"normal": ["100", "300", "400", "500", "700", "800", "900"]
	},
	"M PLUS Rounded 1c": {
		"normal": ["100", "300", "400", "500", "700", "800", "900"]
	},
	"Ma Shan Zheng": {
		"normal": ["400"]
	},
	"Macondo": {
		"normal": ["400"]
	},
	"Macondo Swash Caps": {
		"normal": ["400"]
	},
	"Mada": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Magra": {
		"normal": ["400", "700"]
	},
	"Maiden Orange": {
		"normal": ["400"]
	},
	"Maitree": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Major Mono Display": {
		"normal": ["400"]
	},
	"Mako": {
		"normal": ["400"]
	},
	"Mali": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Mallanna": {
		"normal": ["400"]
	},
	"Mandali": {
		"normal": ["400"]
	},
	"Manjari": {
		"normal": ["100", "400", "700"]
	},
	"Manrope": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Mansalva": {
		"normal": ["400"]
	},
	"Manuale": {
		"normal": ["400", "500", "600", "700"],
		"italic": ["400", "500", "600", "700"]
	},
	"Marcellus": {
		"normal": ["400"]
	},
	"Marcellus SC": {
		"normal": ["400"]
	},
	"Marck Script": {
		"normal": ["400"]
	},
	"Margarine": {
		"normal": ["400"]
	},
	"Markazi Text": {
		"normal": ["400", "500", "600", "700"]
	},
	"Marko One": {
		"normal": ["400"]
	},
	"Marmelad": {
		"normal": ["400"]
	},
	"Martel": {
		"normal": ["200", "300", "400", "600", "700", "800", "900"]
	},
	"Martel Sans": {
		"normal": ["200", "300", "400", "600", "700", "800", "900"]
	},
	"Marvel": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Mate": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Mate SC": {
		"normal": ["400"]
	},
	"Maven Pro": {
		"normal": ["400", "500", "600", "700", "800", "900"]
	},
	"McLaren": {
		"normal": ["400"]
	},
	"Meddon": {
		"normal": ["400"]
	},
	"MedievalSharp": {
		"normal": ["400"]
	},
	"Medula One": {
		"normal": ["400"]
	},
	"Meera Inimai": {
		"normal": ["400"]
	},
	"Megrim": {
		"normal": ["400"]
	},
	"Meie Script": {
		"normal": ["400"]
	},
	"Merienda": {
		"normal": ["400", "700"]
	},
	"Merienda One": {
		"normal": ["400"]
	},
	"Merriweather": {
		"normal": ["300", "400", "700", "900"],
		"italic": ["300", "400", "700", "900"]
	},
	"Merriweather Sans": {
		"normal": ["300", "400", "500", "600", "700", "800"],
		"italic": ["300", "400", "500", "600", "700", "800"]
	},
	"Metal": {
		"normal": ["400"]
	},
	"Metal Mania": {
		"normal": ["400"]
	},
	"Metamorphous": {
		"normal": ["400"]
	},
	"Metrophobic": {
		"normal": ["400"]
	},
	"Michroma": {
		"normal": ["400"]
	},
	"Milonga": {
		"normal": ["400"]
	},
	"Miltonian": {
		"normal": ["400"]
	},
	"Miltonian Tattoo": {
		"normal": ["400"]
	},
	"Mina": {
		"normal": ["400", "700"]
	},
	"Miniver": {
		"normal": ["400"]
	},
	"Miriam Libre": {
		"normal": ["400", "700"]
	},
	"Mirza": {
		"normal": ["400", "500", "600", "700"]
	},
	"Miss Fajardose": {
		"normal": ["400"]
	},
	"Mitr": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Modak": {
		"normal": ["400"]
	},
	"Modern Antiqua": {
		"normal": ["400"]
	},
	"Mogra": {
		"normal": ["400"]
	},
	"Molengo": {
		"normal": ["400"]
	},
	"Molle": {
		"italic": ["400"]
	},
	"Monda": {
		"normal": ["400", "700"]
	},
	"Monofett": {
		"normal": ["400"]
	},
	"Monoton": {
		"normal": ["400"]
	},
	"Monsieur La Doulaise": {
		"normal": ["400"]
	},
	"Montaga": {
		"normal": ["400"]
	},
	"Montez": {
		"normal": ["400"]
	},
	"Montserrat": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Montserrat Alternates": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Montserrat Subrayada": {
		"normal": ["400", "700"]
	},
	"Moul": {
		"normal": ["400"]
	},
	"Moulpali": {
		"normal": ["400"]
	},
	"Mountains of Christmas": {
		"normal": ["400", "700"]
	},
	"Mouse Memoirs": {
		"normal": ["400"]
	},
	"Mr Bedfort": {
		"normal": ["400"]
	},
	"Mr Dafoe": {
		"normal": ["400"]
	},
	"Mr De Haviland": {
		"normal": ["400"]
	},
	"Mrs Saint Delafield": {
		"normal": ["400"]
	},
	"Mrs Sheppards": {
		"normal": ["400"]
	},
	"Mukta": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Mukta Mahee": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Mukta Malar": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Mukta Vaani": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Mulish": {
		"normal": ["200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"MuseoModerno": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Mystery Quest": {
		"normal": ["400"]
	},
	"NTR": {
		"normal": ["400"]
	},
	"Nanum Brush Script": {
		"normal": ["400"]
	},
	"Nanum Gothic": {
		"normal": ["400", "700", "800"]
	},
	"Nanum Gothic Coding": {
		"normal": ["400", "700"]
	},
	"Nanum Myeongjo": {
		"normal": ["400", "700", "800"]
	},
	"Nanum Pen Script": {
		"normal": ["400"]
	},
	"Nerko One": {
		"normal": ["400"]
	},
	"Neucha": {
		"normal": ["400"]
	},
	"Neuton": {
		"normal": ["200", "300", "400", "700", "800"],
		"italic": ["400"]
	},
	"New Rocker": {
		"normal": ["400"]
	},
	"New Tegomin": {
		"normal": ["400"]
	},
	"News Cycle": {
		"normal": ["400", "700"]
	},
	"Newsreader": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"],
		"italic": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Niconne": {
		"normal": ["400"]
	},
	"Niramit": {
		"normal": ["200", "300", "400", "500", "600", "700"],
		"italic": ["200", "300", "400", "500", "600", "700"]
	},
	"Nixie One": {
		"normal": ["400"]
	},
	"Nobile": {
		"normal": ["400", "500", "700"],
		"italic": ["400", "500", "700"]
	},
	"Nokora": {
		"normal": ["400", "700"]
	},
	"Norican": {
		"normal": ["400"]
	},
	"Nosifer": {
		"normal": ["400"]
	},
	"Notable": {
		"normal": ["400"]
	},
	"Nothing You Could Do": {
		"normal": ["400"]
	},
	"Noticia Text": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Noto Sans": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Noto Sans HK": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Noto Sans JP": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Noto Sans KR": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Noto Sans SC": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Noto Sans TC": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Noto Serif": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Noto Serif JP": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Noto Serif KR": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Noto Serif SC": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Noto Serif TC": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Nova Cut": {
		"normal": ["400"]
	},
	"Nova Flat": {
		"normal": ["400"]
	},
	"Nova Mono": {
		"normal": ["400"]
	},
	"Nova Oval": {
		"normal": ["400"]
	},
	"Nova Round": {
		"normal": ["400"]
	},
	"Nova Script": {
		"normal": ["400"]
	},
	"Nova Slim": {
		"normal": ["400"]
	},
	"Nova Square": {
		"normal": ["400"]
	},
	"Numans": {
		"normal": ["400"]
	},
	"Nunito": {
		"normal": ["200", "300", "400", "600", "700", "800", "900"],
		"italic": ["200", "300", "400", "600", "700", "800", "900"]
	},
	"Nunito Sans": {
		"normal": ["200", "300", "400", "600", "700", "800", "900"],
		"italic": ["200", "300", "400", "600", "700", "800", "900"]
	},
	"Odibee Sans": {
		"normal": ["400"]
	},
	"Odor Mean Chey": {
		"normal": ["400"]
	},
	"Offside": {
		"normal": ["400"]
	},
	"Oi": {
		"normal": ["400"]
	},
	"Old Standard TT": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Oldenburg": {
		"normal": ["400"]
	},
	"Oleo Script": {
		"normal": ["400", "700"]
	},
	"Oleo Script Swash Caps": {
		"normal": ["400", "700"]
	},
	"Open Sans": {
		"normal": ["300", "400", "600", "700", "800"],
		"italic": ["300", "400", "600", "700", "800"]
	},
	"Open Sans Condensed": {
		"normal": ["300", "700"],
		"italic": ["300"],
		"width": "75"
	},
	"Oranienbaum": {
		"normal": ["400"]
	},
	"Orbitron": {
		"normal": ["400", "500", "600", "700", "800", "900"]
	},
	"Oregano": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Orelega One": {
		"normal": ["400"]
	},
	"Orienta": {
		"normal": ["400"]
	},
	"Original Surfer": {
		"normal": ["400"]
	},
	"Oswald": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Over the Rainbow": {
		"normal": ["400"]
	},
	"Overlock": {
		"normal": ["400", "700", "900"],
		"italic": ["400", "700", "900"]
	},
	"Overlock SC": {
		"normal": ["400"]
	},
	"Overpass": {
		"normal": ["100", "200", "300", "400", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "600", "700", "800", "900"]
	},
	"Overpass Mono": {
		"normal": ["300", "400", "600", "700"]
	},
	"Ovo": {
		"normal": ["400"]
	},
	"Oxanium": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Oxygen": {
		"normal": ["300", "400", "700"]
	},
	"Oxygen Mono": {
		"normal": ["400"]
	},
	"PT Mono": {
		"normal": ["400"]
	},
	"PT Sans": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"PT Sans Caption": {
		"normal": ["400", "700"]
	},
	"PT Sans Narrow": {
		"normal": ["400", "700"]
	},
	"PT Serif": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"PT Serif Caption": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Pacifico": {
		"normal": ["400"]
	},
	"Padauk": {
		"normal": ["400", "700"]
	},
	"Palanquin": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Palanquin Dark": {
		"normal": ["400", "500", "600", "700"]
	},
	"Pangolin": {
		"normal": ["400"]
	},
	"Paprika": {
		"normal": ["400"]
	},
	"Parisienne": {
		"normal": ["400"]
	},
	"Passero One": {
		"normal": ["400"]
	},
	"Passion One": {
		"normal": ["400", "700", "900"]
	},
	"Pathway Gothic One": {
		"normal": ["400"]
	},
	"Patrick Hand": {
		"normal": ["400"]
	},
	"Patrick Hand SC": {
		"normal": ["400"]
	},
	"Pattaya": {
		"normal": ["400"]
	},
	"Patua One": {
		"normal": ["400"]
	},
	"Pavanam": {
		"normal": ["400"]
	},
	"Paytone One": {
		"normal": ["400"]
	},
	"Peddana": {
		"normal": ["400"]
	},
	"Peralta": {
		"normal": ["400"]
	},
	"Permanent Marker": {
		"normal": ["400"]
	},
	"Petit Formal Script": {
		"normal": ["400"]
	},
	"Petrona": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Philosopher": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Piazzolla": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Piedra": {
		"normal": ["400"]
	},
	"Pinyon Script": {
		"normal": ["400"]
	},
	"Pirata One": {
		"normal": ["400"]
	},
	"Plaster": {
		"normal": ["400"]
	},
	"Play": {
		"normal": ["400", "700"]
	},
	"Playball": {
		"normal": ["400"]
	},
	"Playfair Display": {
		"normal": ["400", "500", "600", "700", "800", "900"],
		"italic": ["400", "500", "600", "700", "800", "900"]
	},
	"Playfair Display SC": {
		"normal": ["400", "700", "900"],
		"italic": ["400", "700", "900"]
	},
	"Podkova": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Poiret One": {
		"normal": ["400"]
	},
	"Poller One": {
		"normal": ["400"]
	},
	"Poly": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Pompiere": {
		"normal": ["400"]
	},
	"Pontano Sans": {
		"normal": ["400"]
	},
	"Poor Story": {
		"normal": ["400"]
	},
	"Poppins": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Port Lligat Sans": {
		"normal": ["400"]
	},
	"Port Lligat Slab": {
		"normal": ["400"]
	},
	"Potta One": {
		"normal": ["400"]
	},
	"Pragati Narrow": {
		"normal": ["400", "700"]
	},
	"Prata": {
		"normal": ["400"]
	},
	"Preahvihear": {
		"normal": ["400"]
	},
	"Press Start 2P": {
		"normal": ["400"]
	},
	"Pridi": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Princess Sofia": {
		"normal": ["400"]
	},
	"Prociono": {
		"normal": ["400"]
	},
	"Prompt": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Prosto One": {
		"normal": ["400"]
	},
	"Proza Libre": {
		"normal": ["400", "500", "600", "700", "800"],
		"italic": ["400", "500", "600", "700", "800"]
	},
	"Public Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Puritan": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Purple Purse": {
		"normal": ["400"]
	},
	"Quando": {
		"normal": ["400"]
	},
	"Quantico": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Quattrocento": {
		"normal": ["400", "700"]
	},
	"Quattrocento Sans": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Questrial": {
		"normal": ["400"]
	},
	"Quicksand": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Quintessential": {
		"normal": ["400"]
	},
	"Qwigley": {
		"normal": ["400"]
	},
	"Racing Sans One": {
		"normal": ["400"]
	},
	"Radley": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Rajdhani": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Rakkas": {
		"normal": ["400"]
	},
	"Raleway": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Raleway Dots": {
		"normal": ["400"]
	},
	"Ramabhadra": {
		"normal": ["400"]
	},
	"Ramaraja": {
		"normal": ["400"]
	},
	"Rambla": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Rammetto One": {
		"normal": ["400"]
	},
	"Ranchers": {
		"normal": ["400"]
	},
	"Rancho": {
		"normal": ["400"]
	},
	"Ranga": {
		"normal": ["400", "700"]
	},
	"Rasa": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Rationale": {
		"normal": ["400"]
	},
	"Ravi Prakash": {
		"normal": ["400"]
	},
	"Recursive": {
		"normal": ["300", "400", "500", "600", "700", "800", "900"]
	},
	"Red Hat Display": {
		"normal": ["400", "500", "700", "900"],
		"italic": ["400", "500", "700", "900"]
	},
	"Red Hat Text": {
		"normal": ["400", "500", "700"],
		"italic": ["400", "500", "700"]
	},
	"Red Rose": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Redressed": {
		"normal": ["400"]
	},
	"Reem Kufi": {
		"normal": ["400"]
	},
	"Reenie Beanie": {
		"normal": ["400"]
	},
	"Reggae One": {
		"normal": ["400"]
	},
	"Revalia": {
		"normal": ["400"]
	},
	"Rhodium Libre": {
		"normal": ["400"]
	},
	"Ribeye": {
		"normal": ["400"]
	},
	"Ribeye Marrow": {
		"normal": ["400"]
	},
	"Righteous": {
		"normal": ["400"]
	},
	"Risque": {
		"normal": ["400"]
	},
	"Roboto": {
		"normal": ["100", "300", "400", "500", "700", "900"],
		"italic": ["100", "300", "400", "500", "700", "900"]
	},
	"Roboto Condensed": {
		"normal": ["300", "400", "700"],
		"italic": ["300", "400", "700"],
		"width": "75"
	},
	"Roboto Mono": {
		"normal": ["100", "200", "300", "400", "500", "600", "700"],
		"italic": ["100", "200", "300", "400", "500", "600", "700"]
	},
	"Roboto Slab": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Rochester": {
		"normal": ["400"]
	},
	"Rock Salt": {
		"normal": ["400"]
	},
	"RocknRoll One": {
		"normal": ["400"]
	},
	"Rokkitt": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Romanesco": {
		"normal": ["400"]
	},
	"Ropa Sans": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Rosario": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Rosarivo": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Rouge Script": {
		"normal": ["400"]
	},
	"Rowdies": {
		"normal": ["300", "400", "700"]
	},
	"Rozha One": {
		"normal": ["400"]
	},
	"Rubik": {
		"normal": ["300", "400", "500", "600", "700", "800", "900"],
		"italic": ["300", "400", "500", "600", "700", "800", "900"]
	},
	"Rubik Mono One": {
		"normal": ["400"]
	},
	"Ruda": {
		"normal": ["400", "500", "600", "700", "800", "900"]
	},
	"Rufina": {
		"normal": ["400", "700"]
	},
	"Ruge Boogie": {
		"normal": ["400"]
	},
	"Ruluko": {
		"normal": ["400"]
	},
	"Rum Raisin": {
		"normal": ["400"]
	},
	"Ruslan Display": {
		"normal": ["400"]
	},
	"Russo One": {
		"normal": ["400"]
	},
	"Ruthie": {
		"normal": ["400"]
	},
	"Rye": {
		"normal": ["400"]
	},
	"Sacramento": {
		"normal": ["400"]
	},
	"Sahitya": {
		"normal": ["400", "700"]
	},
	"Sail": {
		"normal": ["400"]
	},
	"Saira": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Saira Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Saira Extra Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Saira Semi Condensed": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"width": "75"
	},
	"Saira Stencil One": {
		"normal": ["400"]
	},
	"Salsa": {
		"normal": ["400"]
	},
	"Sanchez": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Sancreek": {
		"normal": ["400"]
	},
	"Sansita": {
		"normal": ["400", "700", "800", "900"],
		"italic": ["400", "700", "800", "900"]
	},
	"Sansita Swashed": {
		"normal": ["300", "400", "500", "600", "700", "800", "900"]
	},
	"Sarabun": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800"]
	},
	"Sarala": {
		"normal": ["400", "700"]
	},
	"Sarina": {
		"normal": ["400"]
	},
	"Sarpanch": {
		"normal": ["400", "500", "600", "700", "800", "900"]
	},
	"Satisfy": {
		"normal": ["400"]
	},
	"Sawarabi Gothic": {
		"normal": ["400"]
	},
	"Sawarabi Mincho": {
		"normal": ["400"]
	},
	"Scada": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Scheherazade": {
		"normal": ["400", "700"]
	},
	"Schoolbell": {
		"normal": ["400"]
	},
	"Scope One": {
		"normal": ["400"]
	},
	"Seaweed Script": {
		"normal": ["400"]
	},
	"Secular One": {
		"normal": ["400"]
	},
	"Sedgwick Ave": {
		"normal": ["400"]
	},
	"Sedgwick Ave Display": {
		"normal": ["400"]
	},
	"Sen": {
		"normal": ["400", "700", "800"]
	},
	"Sevillana": {
		"normal": ["400"]
	},
	"Seymour One": {
		"normal": ["400"]
	},
	"Shadows Into Light": {
		"normal": ["400"]
	},
	"Shadows Into Light Two": {
		"normal": ["400"]
	},
	"Shanti": {
		"normal": ["400"]
	},
	"Share": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Share Tech": {
		"normal": ["400"]
	},
	"Share Tech Mono": {
		"normal": ["400"]
	},
	"Shippori Mincho": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Shippori Mincho B1": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Shojumaru": {
		"normal": ["400"]
	},
	"Short Stack": {
		"normal": ["400"]
	},
	"Shrikhand": {
		"normal": ["400"]
	},
	"Siemreap": {
		"normal": ["400"]
	},
	"Sigmar One": {
		"normal": ["400"]
	},
	"Signika": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Signika Negative": {
		"normal": ["300", "400", "600", "700"]
	},
	"Simonetta": {
		"normal": ["400", "900"],
		"italic": ["400", "900"]
	},
	"Single Day": {
		"normal": ["400"]
	},
	"Sintony": {
		"normal": ["400", "700"]
	},
	"Sirin Stencil": {
		"normal": ["400"]
	},
	"Six Caps": {
		"normal": ["400"]
	},
	"Skranji": {
		"normal": ["400", "700"]
	},
	"Slabo 13px": {
		"normal": ["400"]
	},
	"Slabo 27px": {
		"normal": ["400"]
	},
	"Slackey": {
		"normal": ["400"]
	},
	"Smokum": {
		"normal": ["400"]
	},
	"Smythe": {
		"normal": ["400"]
	},
	"Sniglet": {
		"normal": ["400", "800"]
	},
	"Snippet": {
		"normal": ["400"]
	},
	"Snowburst One": {
		"normal": ["400"]
	},
	"Sofadi One": {
		"normal": ["400"]
	},
	"Sofia": {
		"normal": ["400"]
	},
	"Solway": {
		"normal": ["300", "400", "500", "700", "800"]
	},
	"Song Myung": {
		"normal": ["400"]
	},
	"Sonsie One": {
		"normal": ["400"]
	},
	"Sora": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800"]
	},
	"Sorts Mill Goudy": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Source Code Pro": {
		"normal": ["200", "300", "400", "500", "600", "700", "900"],
		"italic": ["200", "300", "400", "500", "600", "700", "900"]
	},
	"Source Sans Pro": {
		"normal": ["200", "300", "400", "600", "700", "900"],
		"italic": ["200", "300", "400", "600", "700", "900"]
	},
	"Source Serif Pro": {
		"normal": ["200", "300", "400", "600", "700", "900"],
		"italic": ["200", "300", "400", "600", "700", "900"]
	},
	"Space Grotesk": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Space Mono": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Spartan": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Special Elite": {
		"normal": ["400"]
	},
	"Spectral": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"],
		"italic": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Spectral SC": {
		"normal": ["200", "300", "400", "500", "600", "700", "800"],
		"italic": ["200", "300", "400", "500", "600", "700", "800"]
	},
	"Spicy Rice": {
		"normal": ["400"]
	},
	"Spinnaker": {
		"normal": ["400"]
	},
	"Spirax": {
		"normal": ["400"]
	},
	"Squada One": {
		"normal": ["400"]
	},
	"Sree Krushnadevaraya": {
		"normal": ["400"]
	},
	"Sriracha": {
		"normal": ["400"]
	},
	"Srisakdi": {
		"normal": ["400", "700"]
	},
	"Staatliches": {
		"normal": ["400"]
	},
	"Stalemate": {
		"normal": ["400"]
	},
	"Stalinist One": {
		"normal": ["400"]
	},
	"Stardos Stencil": {
		"normal": ["400", "700"]
	},
	"Stick": {
		"normal": ["400"]
	},
	"Stint Ultra Condensed": {
		"normal": ["400"],
		"width": "75"
	},
	"Stint Ultra Expanded": {
		"normal": ["400"],
		"width": "125"
	},
	"Stoke": {
		"normal": ["300", "400"]
	},
	"Strait": {
		"normal": ["400"]
	},
	"Stylish": {
		"normal": ["400"]
	},
	"Sue Ellen Francisco": {
		"normal": ["400"]
	},
	"Suez One": {
		"normal": ["400"]
	},
	"Sulphur Point": {
		"normal": ["300", "400", "700"]
	},
	"Sumana": {
		"normal": ["400", "700"]
	},
	"Sunflower": {
		"normal": ["300", "500", "700"]
	},
	"Sunshiney": {
		"normal": ["400"]
	},
	"Supermercado One": {
		"normal": ["400"]
	},
	"Sura": {
		"normal": ["400", "700"]
	},
	"Suranna": {
		"normal": ["400"]
	},
	"Suravaram": {
		"normal": ["400"]
	},
	"Suwannaphum": {
		"normal": ["400"]
	},
	"Swanky and Moo Moo": {
		"normal": ["400"]
	},
	"Syncopate": {
		"normal": ["400", "700"]
	},
	"Syne": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Syne Mono": {
		"normal": ["400"]
	},
	"Syne Tactile": {
		"normal": ["400"]
	},
	"Tajawal": {
		"normal": ["200", "300", "400", "500", "700", "800", "900"]
	},
	"Tangerine": {
		"normal": ["400", "700"]
	},
	"Taprom": {
		"normal": ["400"]
	},
	"Tauri": {
		"normal": ["400"]
	},
	"Taviraj": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Teko": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Telex": {
		"normal": ["400"]
	},
	"Tenali Ramakrishna": {
		"normal": ["400"]
	},
	"Tenor Sans": {
		"normal": ["400"]
	},
	"Text Me One": {
		"normal": ["400"]
	},
	"Texturina": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Thasadith": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"The Girl Next Door": {
		"normal": ["400"]
	},
	"Tienne": {
		"normal": ["400", "700", "900"]
	},
	"Tillana": {
		"normal": ["400", "500", "600", "700", "800"]
	},
	"Timmana": {
		"normal": ["400"]
	},
	"Tinos": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Titan One": {
		"normal": ["400"]
	},
	"Titillium Web": {
		"normal": ["200", "300", "400", "600", "700", "900"],
		"italic": ["200", "300", "400", "600", "700"]
	},
	"Tomorrow": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Trade Winds": {
		"normal": ["400"]
	},
	"Train One": {
		"normal": ["400"]
	},
	"Trirong": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Trispace": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800"]
	},
	"Trocchi": {
		"normal": ["400"]
	},
	"Trochut": {
		"normal": ["400", "700"],
		"italic": ["400"]
	},
	"Truculenta": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Trykker": {
		"normal": ["400"]
	},
	"Tulpen One": {
		"normal": ["400"]
	},
	"Turret Road": {
		"normal": ["200", "300", "400", "500", "700", "800"]
	},
	"Ubuntu": {
		"normal": ["300", "400", "500", "700"],
		"italic": ["300", "400", "500", "700"]
	},
	"Ubuntu Condensed": {
		"normal": ["400"],
		"width": "75"
	},
	"Ubuntu Mono": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Ultra": {
		"normal": ["400"]
	},
	"Uncial Antiqua": {
		"normal": ["400"]
	},
	"Underdog": {
		"normal": ["400"]
	},
	"Unica One": {
		"normal": ["400"]
	},
	"UnifrakturCook": {
		"normal": ["700"]
	},
	"UnifrakturMaguntia": {
		"normal": ["400"]
	},
	"Unkempt": {
		"normal": ["400", "700"]
	},
	"Unlock": {
		"normal": ["400"]
	},
	"Unna": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"VT323": {
		"normal": ["400"]
	},
	"Vampiro One": {
		"normal": ["400"]
	},
	"Varela": {
		"normal": ["400"]
	},
	"Varela Round": {
		"normal": ["400"]
	},
	"Varta": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Vast Shadow": {
		"normal": ["400"]
	},
	"Vesper Libre": {
		"normal": ["400", "500", "700", "900"]
	},
	"Viaoda Libre": {
		"normal": ["400"]
	},
	"Vibes": {
		"normal": ["400"]
	},
	"Vibur": {
		"normal": ["400"]
	},
	"Vidaloka": {
		"normal": ["400"]
	},
	"Viga": {
		"normal": ["400"]
	},
	"Voces": {
		"normal": ["400"]
	},
	"Volkhov": {
		"normal": ["400", "700"],
		"italic": ["400", "700"]
	},
	"Vollkorn": {
		"normal": ["400", "500", "600", "700", "800", "900"],
		"italic": ["400", "500", "600", "700", "800", "900"]
	},
	"Vollkorn SC": {
		"normal": ["400", "600", "700", "900"]
	},
	"Voltaire": {
		"normal": ["400"]
	},
	"Waiting for the Sunrise": {
		"normal": ["400"]
	},
	"Wallpoet": {
		"normal": ["400"]
	},
	"Walter Turncoat": {
		"normal": ["400"]
	},
	"Warnes": {
		"normal": ["400"]
	},
	"Wellfleet": {
		"normal": ["400"]
	},
	"Wendy One": {
		"normal": ["400"]
	},
	"Wire One": {
		"normal": ["400"]
	},
	"Work Sans": {
		"normal": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
		"italic": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
	},
	"Xanh Mono": {
		"normal": ["400"],
		"italic": ["400"]
	},
	"Yanone Kaffeesatz": {
		"normal": ["200", "300", "400", "500", "600", "700"]
	},
	"Yantramanav": {
		"normal": ["100", "300", "400", "500", "700", "900"]
	},
	"Yatra One": {
		"normal": ["400"]
	},
	"Yellowtail": {
		"normal": ["400"]
	},
	"Yeon Sung": {
		"normal": ["400"]
	},
	"Yeseva One": {
		"normal": ["400"]
	},
	"Yesteryear": {
		"normal": ["400"]
	},
	"Yrsa": {
		"normal": ["300", "400", "500", "600", "700"]
	},
	"Yusei Magic": {
		"normal": ["400"]
	},
	"ZCOOL KuaiLe": {
		"normal": ["400"]
	},
	"ZCOOL QingKe HuangYou": {
		"normal": ["400"]
	},
	"ZCOOL XiaoWei": {
		"normal": ["400"]
	},
	"Zen Dots": {
		"normal": ["400"]
	},
	"Zeyada": {
		"normal": ["400"]
	},
	"Zhi Mang Xing": {
		"normal": ["400"]
	},
	"Zilla Slab": {
		"normal": ["300", "400", "500", "600", "700"],
		"italic": ["300", "400", "500", "600", "700"]
	},
	"Zilla Slab Highlight": {
		"normal": ["400", "700"]
	}
};