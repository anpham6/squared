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
            const time = new Date().getTime();
            squared.parseDocument().then(function() {
                squared.settings.outputEmptyCopyDirectory = true;
                squared.copyToDisk('C:/Users/An/git/flexbox', {
                    assets: [
                        {
                            pathname: 'res/drawable',
                            filename: 'ic_launcher_background.xml',
                            uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_background.xml'
                        },
                        {
                            pathname: 'res/drawable-v24',
                            filename: 'ic_launcher_foreground.xml',
                            uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_foreground.xml'
                        }
                    ]
                });
                console.log(new Date().getTime() - time);
            });
        });
    });
});

System.import('/build/src/main.js').then(result => {
    squared = result;
    System.import('/build/src/base/main.js').then(result => {
        squared.base = result;
        System.import('/build/src/svg/main.js').then(result => {
            squared.svg = result;
            System.import('/build/android-framework/src/main.js').then(result => {
                android = result.default;
                squared.setFramework(android);
                const time = new Date().getTime();
                squared.parseDocument().then(function() {
                    squared.settings.outputEmptyCopyDirectory = true;
                    squared.copyToDisk('C:/Users/An/git/flexbox', {
                        assets: [
                            {
                                pathname: 'res/drawable',
                                filename: 'ic_launcher_background.xml',
                                uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_background.xml'
                            },
                            {
                                pathname: 'res/drawable-v24',
                                filename: 'ic_launcher_foreground.xml',
                                uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_foreground.xml'
                            }
                        ]
                    });
                    console.log(new Date().getTime() - time);
                });
            });
        });
    });
});*/

document.addEventListener('DOMContentLoaded', function() {
    squared.setFramework(android);
    const time = new Date().getTime();
    squared.parseDocument().then(function() {
        squared.settings.outputEmptyCopyDirectory = true;
        squared.copyToDisk('C:/Users/An/git/flexbox', {
            assets: [
                {
                    pathname: 'res/drawable',
                    filename: 'ic_launcher_background.xml',
                    uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_background.xml'
                },
                {
                    pathname: 'res/drawable-v24',
                    filename: 'ic_launcher_foreground.xml',
                    uri: 'C:/Users/An/git/squared/html/demos-dev/images/ic_launcher_foreground.xml'
                }
            ]
        });
        console.log(new Date().getTime() - time);
    });
});