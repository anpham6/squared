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
    },
    filename: 'res/values/styles.xml'
};