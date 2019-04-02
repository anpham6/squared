const ORDERING = ['ordering'];

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