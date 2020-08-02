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
                '@': ['ordering'],
                '>': {
                    'set': {
                        '^': 'android',
                        '@': ['ordering'],
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