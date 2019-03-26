const ORDERING = ['ordering'];
const OBJECTANIMATOR = {
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
                            'objectAnimator': OBJECTANIMATOR
                        },
                    },
                    'objectAnimator': OBJECTANIMATOR
                }
            },
            'objectAnimator': OBJECTANIMATOR
        }
    }
};