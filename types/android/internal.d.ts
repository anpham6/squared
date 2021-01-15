/* eslint no-shadow: "off" */

declare namespace internal {
    namespace android {
        const enum EXT_ANDROID {
            EXTERNAL = 'android.external',
            SUBSTITUTE = 'android.substitute',
            DELEGATE_BACKGROUND = 'android.delegate.background',
            DELEGATE_MAXWIDTHHEIGHT = 'android.delegate.max-width-height',
            DELEGATE_MULTILINE = 'android.delegate.multiline',
            DELEGATE_NEGATIVEX = 'android.delegate.negative-x',
            DELEGATE_PERCENT = 'android.delegate.percent',
            DELEGATE_POSITIVEX = 'android.delegate.positive-x',
            DELEGATE_RADIOGROUP = 'android.delegate.radiogroup',
            DELEGATE_SCROLLBAR = 'android.delegate.scrollbar',
            DELEGATE_VERTICALALIGN = 'android.delegate.verticalalign',
            RESOURCE_INCLUDES = 'android.resource.includes',
            RESOURCE_BACKGROUND = 'android.resource.background',
            RESOURCE_SVG = 'android.resource.svg',
            RESOURCE_STRINGS = 'android.resource.strings',
            RESOURCE_FONTS = 'android.resource.fonts',
            RESOURCE_DIMENS = 'android.resource.dimens',
            RESOURCE_DATA = 'android.resource.data',
            RESOURCE_STYLES = 'android.resource.styles'
        }

        const enum LAYOUT_STRING {
            MARGIN = 'layout_margin',
            MARGIN_VERTICAL = 'layout_marginVertical',
            MARGIN_HORIZONTAL = 'layout_marginHorizontal',
            MARGIN_TOP = 'layout_marginTop',
            MARGIN_RIGHT = 'layout_marginRight',
            MARGIN_BOTTOM = 'layout_marginBottom',
            MARGIN_LEFT = 'layout_marginLeft',
            PADDING = 'padding',
            PADDING_VERTICAL = 'paddingVertical',
            PADDING_HORIZONTAL = 'paddingHorizontal',
            PADDING_TOP = 'paddingTop',
            PADDING_RIGHT = 'paddingRight',
            PADDING_BOTTOM = 'paddingBottom',
            PADDING_LEFT = 'paddingLeft'
        }
    }
}