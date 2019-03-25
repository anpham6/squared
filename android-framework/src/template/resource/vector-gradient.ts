export default {
    'vector': {
        '@': ['xmlns:android', 'xmlns:aapt', 'android:name', 'android:width', 'android:height', 'android:viewportWidth', 'android:viewportHeight', 'android:alpha'],
        '>': {
            'path': {
                '^': 'android',
                '@': ['name', 'fillColor', 'fillAlpha', 'fillType', 'strokeColor', 'strokeAlpha', 'strokeWidth', 'strokeLineCap', 'strokeLineJoin', 'strokeMiterLimit', 'trimPathStart', 'trimPathEnd', 'trimPathOffset', 'pathData'],
                '>': {
                    'aapt:attr': {
                        '@': ['name'],
                        '>': {
                            'gradient': {
                                '^': 'android',
                                '@': ['type', 'startColor', 'endColor', 'centerColor', 'angle', 'startX', 'startY', 'endX', 'endY', 'centerX', 'centerY', 'gradientRadius', 'tileMode'],
                                '>': {
                                    'item': {
                                        '^': 'android',
                                        '@': ['offset', 'color']
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};