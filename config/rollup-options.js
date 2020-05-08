export const prettier_options = {
    parser: 'babel',
    tabWidth: 4
};

export const terser_options = {
    compress: {
        loops: false,
        booleans: false,
        conditionals: false,
        switches: false
    },
    keep_classnames: true
};