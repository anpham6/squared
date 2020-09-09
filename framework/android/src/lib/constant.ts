export enum SCREEN_DENSITY {
    LDPI = 120,
    MDPI = 160,
    HDPI = 240,
    XHDPI = 320,
    XXHDPI = 480,
    XXXHDPI = 640
}

export enum CONTAINER_NODE {
    RADIO = 1,
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
    UNKNOWN
}

export const CONTAINER_ELEMENT = {
    PLAINTEXT: CONTAINER_NODE.TEXT,
    HR: CONTAINER_NODE.LINE,
    SVG: CONTAINER_NODE.SVG,
    IMG: CONTAINER_NODE.IMAGE,
    CANVAS: CONTAINER_NODE.IMAGE,
    BUTTON: CONTAINER_NODE.BUTTON,
    SELECT: CONTAINER_NODE.SELECT,
    TEXTAREA: CONTAINER_NODE.EDIT,
    METER: CONTAINER_NODE.PROGRESS,
    PROGRESS: CONTAINER_NODE.PROGRESS,
    AUDIO: CONTAINER_NODE.VIDEOVIEW,
    VIDEO: CONTAINER_NODE.VIDEOVIEW,
    IFRAME: CONTAINER_NODE.WEBVIEW,
    INPUT_RANGE: CONTAINER_NODE.RANGE,
    INPUT_TEXT: CONTAINER_NODE.EDIT,
    INPUT_PASSWORD: CONTAINER_NODE.EDIT,
    INPUT_NUMBER: CONTAINER_NODE.EDIT,
    INPUT_EMAIL: CONTAINER_NODE.EDIT,
    INPUT_SEARCH: CONTAINER_NODE.EDIT,
    INPUT_URL: CONTAINER_NODE.EDIT,
    INPUT_DATE: CONTAINER_NODE.EDIT,
    INPUT_TEL: CONTAINER_NODE.EDIT,
    INPUT_TIME: CONTAINER_NODE.EDIT,
    INPUT_WEEK: CONTAINER_NODE.EDIT,
    INPUT_MONTH: CONTAINER_NODE.EDIT,
    INPUT_BUTTON: CONTAINER_NODE.BUTTON,
    INPUT_FILE: CONTAINER_NODE.BUTTON,
    INPUT_IMAGE: CONTAINER_NODE.BUTTON,
    INPUT_COLOR: CONTAINER_NODE.BUTTON,
    INPUT_SUBMIT: CONTAINER_NODE.BUTTON,
    INPUT_RESET: CONTAINER_NODE.BUTTON,
    INPUT_CHECKBOX: CONTAINER_NODE.CHECKBOX,
    INPUT_RADIO: CONTAINER_NODE.RADIO,
    'INPUT_DATETIME_LOCAL': CONTAINER_NODE.EDIT
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
    GRID: 'GridLayout',
    RELATIVE: 'RelativeLayout',
    WEBVIEW: 'WebView',
    VIDEOVIEW: 'VideoView',
    RADIOGROUP: 'RadioGroup',
    HORIZONTAL_SCROLL: 'HorizontalScrollView',
    VERTICAL_SCROLL: 'android.support.v4.widget.NestedScrollView',
    CONSTRAINT: 'android.support.constraint.ConstraintLayout',
    GUIDELINE: 'android.support.constraint.Guideline',
    BARRIER: 'android.support.constraint.Barrier'
};

export const CONTAINER_TAGNAME_X = {
    VERTICAL_SCROLL: 'androidx.core.widget.NestedScrollView',
    CONSTRAINT: 'androidx.constraintlayout.widget.ConstraintLayout',
    GUIDELINE: 'androidx.constraintlayout.widget.Guideline',
    BARRIER: 'androidx.constraintlayout.widget.Barrier'
};

export const SUPPORT_TAGNAME = {
    DRAWER: 'android.support.v4.widget.DrawerLayout',
    NAVIGATION_VIEW: 'android.support.design.widget.NavigationView',
    COORDINATOR: 'android.support.design.widget.CoordinatorLayout',
    APPBAR: 'android.support.design.widget.AppBarLayout',
    COLLAPSING_TOOLBAR: 'android.support.design.widget.CollapsingToolbarLayout',
    TOOLBAR: 'android.support.v7.widget.Toolbar',
    FLOATING_ACTION_BUTTON: 'android.support.design.widget.FloatingActionButton',
    BOTTOM_NAVIGATION: 'android.support.design.widget.BottomNavigationView'
};

export const SUPPORT_TAGNAME_X = {
    DRAWER: 'androidx.drawerlayout.widget.DrawerLayout',
    NAVIGATION_VIEW: 'com.google.android.material.navigation.NavigationView',
    COORDINATOR: 'androidx.coordinatorlayout.widget.CoordinatorLayout',
    APPBAR: 'com.google.android.material.appbar.AppBarLayout',
    COLLAPSING_TOOLBAR: 'com.google.android.material.appbar.CollapsingToolbarLayout',
    TOOLBAR: 'androidx.appcompat.widget.Toolbar',
    FLOATING_ACTION_BUTTON: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
    BOTTOM_NAVIGATION: 'com.google.android.material.bottomnavigation.BottomNavigationView'
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

export const RESERVED_JAVA = new Set([
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
]);