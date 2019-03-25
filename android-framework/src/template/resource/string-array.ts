export default {
    'resources': {
        '>': {
            'string-array': {
                '@': ['name'],
                '>': {
                    'item': {
                        '~': true
                    }
                }
            }
        }
    },
    filename: 'res/values/string_arrays.xml'
};