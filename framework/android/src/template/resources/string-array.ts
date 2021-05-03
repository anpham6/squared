export default {
    'resources': {
        '>': {
            'array': {
                '@': ['name', 'translatable'],
                '>': {
                    'item': {
                        '~': true
                    }
                }
            },
            'string-array': {
                '@': ['name', 'translatable'],
                '>': {
                    'item': {
                        '~': true
                    }
                }
            }
        }
    }
};