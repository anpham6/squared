var squared = {};
var android = null;

System.config({
    packages: {
        '/build': { defaultExtension: 'js' }
    },
    map: {
        'plugin-babel': '/node_modules/systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build': '/node_modules/systemjs-plugin-babel/systemjs-babel-browser.js'
    },
    meta: {
       '*.js': {
           babelOptions: {
               es2015: false
           }
       }
   },
   transpiler: 'plugin-babel'
});

function stringify(template) {
    var output = '';
    for (var name in template) {
        for (var i = 0; i < template[name].length; i += 2) {
            output += template[name][i];
            if (template[name][i + 1]) {
                output += (name === 'drawableImage' ? '\n' : '') +
                          `<!-- filename: ${template[name][i + 1]} -->\n\n`;
            }
        }
    }
    return output;
}

function copy(id) {
    var element = document.getElementById(id);
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    setTimeout(function() { window.getSelection().removeAllRanges(); }, 1);
}