export default {
    'shape': {
        '@': ['xmlns:android', 'android:shape'],
        '>': {
            'solid': {
                '^': 'android',
                '@': ['color']
            },
            'gradient': {
                '^': 'android',
                '@': ['type', 'startColor', 'endColor', 'centerColor', 'angle', 'centerX', 'centerY', 'gradientRadius', 'visible']
            },
            'corners': {
                '^': 'android',
                '@': ['radius', 'topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius']
            },
            'stroke': {
                '^': 'android',
                '@': ['width', 'color', 'dashWidth', 'dashGap']
            }
        }
    }
};