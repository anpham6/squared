const ORDERING = ['ordering'];

export const OBJECTANIMATOR = {
    'objectAnimator': {
        '^': 'android',
        '@': ['propertyName', 'interpolator', 'valueType', 'valueFrom', 'valueTo', 'startOffset', 'duration', 'repeatCount'],
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
        '@': ['xmlns:android', 'android:ordering'],
        '>': {
            'set': {
                '^': 'android',
                '@': ORDERING,
                '>': {
                    'set': {
                        '^': 'android',
                        '@': ORDERING,
                        '>': {
                            'objectAnimator': OBJECTANIMATOR.objectAnimator
                        },
                    },
                    'objectAnimator': OBJECTANIMATOR.objectAnimator
                }
            },
            'objectAnimator': OBJECTANIMATOR.objectAnimator
        }
    }
};