const SET_ATTR = ['duration', 'fillAfter', 'fillBefore', 'ordering', 'repeatCount', 'repeatMode', 'shareInterpolator', 'startOffset'];

export const OBJECTANIMATOR = {
    'objectAnimator': {
        '^': 'android',
        '@': ['propertyName', 'startOffset', 'duration', 'repeatCount', 'interpolator', 'valueType', 'valueFrom', 'valueTo'],
        '>': {
            'propertyValuesHolder': {
                '^': 'android',
                '@': ['propertyName'],
                '>': {
                    'keyframe': {
                        '^': 'android',
                        '@': ['interpolator', 'fraction', 'value']
                    }
                }
            }
        }
    }
};

export default {
    'set': {
        '@': ['xmlns:android', ...SET_ATTR.map(value => 'android:' + value)],
        '>': {
            'set': {
                '^': 'android',
                '@': SET_ATTR,
                '>': {
                    'set': {
                        '^': 'android',
                        '@': SET_ATTR,
                        '>': {
                            'objectAnimator': OBJECTANIMATOR.objectAnimator
                        }
                    },
                    'objectAnimator': OBJECTANIMATOR.objectAnimator
                }
            },
            'objectAnimator': OBJECTANIMATOR.objectAnimator
        }
    }
};