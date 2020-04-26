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
                squared.copyToDisk('C:/Users/An/git/flexbox', {
                    assets: [
                        {
                            pathname: 'app/src/main/res/drawable',
                            filename: 'ic_launcher_background.xml',
                            uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_background.xml'
                        },
                        {
                            pathname: 'app/src/main/res/drawable-v24',
                            filename: 'ic_launcher_foreground.xml',
                            uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_foreground.xml'
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
                    squared.copyToDisk('C:/Users/An/git/flexbox', {
                        assets: [
                            {
                                pathname: 'app/src/main/res/drawable',
                                filename: 'ic_launcher_background.xml',
                                uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_background.xml'
                            },
                            {
                                pathname: 'app/src/main/res/drawable-v24',
                                filename: 'ic_launcher_foreground.xml',
                                uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_foreground.xml'
                            }
                        ]
                    });
                    console.log(new Date().getTime() - time);
                });
            });
        });
    });
});*/

document.addEventListener('DOMContentLoaded', () => {
    squared.setFramework(android);
    const time = Date.now();
    squared.parseDocument()
        .then(() => {
            console.log('SQ: ' + (Date.now() - time));
            const copyTo = new URLSearchParams(location.search).get('copyTo');
            if (copyTo) {
                squared.copyToDisk(copyTo).then((result) => {
                    const element = squared.lib.dom.createElement(document.body, 'div', { whiteSpace: 'pre' });
                    if (result.success) {
                        element.innerHTML = result.files.join('\n');
                    }
                    element.id = 'md5_complete';
                });
            }
            else {
                squared.settings.outputEmptyCopyDirectory = true;
                squared.copyToDisk('C:/Users/An/git/flexbox', {
                    assets: [
                        {
                            pathname: 'app/src/main/res/drawable',
                            filename: 'ic_launcher_background.xml',
                            uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_background.xml'
                        },
                        {
                            pathname: 'app/src/main/res/drawable-v24',
                            filename: 'ic_launcher_foreground.xml',
                            uri: 'C:/Users/An/git/squared/html/common/images/ic_launcher_foreground.xml'
                        }
                    ]
                })
                .then(() => console.log('CP: ' + (Date.now() - time)));
            }
            console.log('NE: ' + (Date.now() - time));
        })
        .catch(err => console.log(err));
});