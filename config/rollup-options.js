export const prettier_options = {
    parser: 'babel',
    printWidth: 120,
    tabWidth: 4,
    singleQuote: true,
    quoteProps: 'preserve',
    arrowParens: 'avoid'
};

export const terser_options = {
    compress: {
        unused: false
    },
    keep_classnames: true
};