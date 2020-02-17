import SHAPE from './shape';

export default {
    'layer-list': {
        '@': ['xmlns:android'],
        '>': {
            'item': {
                '^': 'android',
                '@': ['left', 'start', 'top', 'right', 'end', 'bottom', 'drawable', 'width', 'height', 'gravity'],
                '>': {
                    'shape': SHAPE.shape,
                    'bitmap': {
                        '^': 'android',
                        '@': ['src', 'gravity', 'tileMode', 'tileModeX', 'tileModeY']
                    },
                    'rotate': {
                        '^': 'android',
                        '@': ['drawable', 'fromDegrees', 'toDegrees', 'pivotX', 'pivotY', 'visible']
                    }
                }
            }
        }
    }
};