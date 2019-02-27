/*var squared = null;

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

System.import('/build/src/main.js').then(result => {
    squared = result;
    System.import('/build/src/base/main.js').then(result => {
        squared.base = result;
        System.import('/build/android-framework/src/main.js').then(result => {
            android = result.default;
            squared.setFramework(android);
            squared.parseDocument().then(function() {
                squared.close();
                squared.saveAllToDisk();
            });
        });
    });
});*/

document.addEventListener('DOMContentLoaded', function() {
    squared.setFramework(android);
    squared.parseDocument().then(function() {
        squared.close();
        squared.saveAllToDisk();
    });
});