export default {
    'resources': {
        '>': {
            'style': {
                '@': ['name', 'parent'],
                '>': {
                    'item': {
                        '@': ['name'],
                        '~': true
                    }
                }
            }
        }
    }
};