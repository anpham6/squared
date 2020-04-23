/*var squared = null;

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
                squared.copyToDisk('/Users/anpham/git/flexbox', {
                    assets: [
                        {
                            pathname: 'app/src/main/res/drawable',
                            filename: 'ic_launcher_background.xml',
                            uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_background.xml'
                        },
                        {
                            pathname: 'app/src/main/res/drawable-v24',
                            filename: 'ic_launcher_foreground.xml',
                            uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_foreground.xml'
                        }
                    ]
                });
                console.log(new Date().getTime() - time);
            });
        });
    });
});*/

/*System.import('/build/src/main.js').then(result => {
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
                    squared.copyToDisk('/Users/anpham/git/flexbox', {
                        assets: [
                            {
                                pathname: 'app/src/main/res/drawable',
                                filename: 'ic_launcher_background.xml',
                                uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_background.xml'
                            },
                            {
                                pathname: 'app/src/main/res/drawable-v24',
                                filename: 'ic_launcher_foreground.xml',
                                uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_foreground.xml'
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
        squared.copyToDisk('/Users/anpham/git/flexbox', {
            assets: [
                {
                    pathname: 'app/src/main/res/drawable',
                    filename: 'ic_launcher_background.xml',
                    uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_background.xml'
                },
                {
                    pathname: 'app/src/main/res/drawable-v24',
                    filename: 'ic_launcher_foreground.xml',
                    uri: '/Users/anpham/git/squared/html/demos/images/ic_launcher_foreground.xml'
                }
            ]
        });
        console.log(new Date().getTime() - time);
    });
});