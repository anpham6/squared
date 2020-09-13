export const VECTOR_PATH = {
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
};

export const VECTOR_GROUP = {
    'group': {
        '^': 'android',
        '@': ['name', 'rotation', 'scaleX', 'scaleY', 'translateX', 'translateY', 'pivotX', 'pivotY'],
        '>>': true,
        '>': {
            'clip-path': {
                '^': 'android',
                '@': ['name', 'pathData', 'fillType']
            },
            'path': VECTOR_PATH.path
        },
        '#': 'include'
    }
};

export const VECTOR_TMPL = {
    'vector': {
        '@': ['xmlns:android', 'xmlns:aapt', 'android:name', 'android:width', 'android:height', 'android:viewportWidth', 'android:viewportHeight', 'android:alpha'],
        '>': {
            'path': VECTOR_PATH.path
        },
        '#': 'include'
    }
};