/*var squared = null;

System.import('/build/src/main.js').then(result => {
    squared = result;
    System.import('/build/src/base/main.js').then(result => {
        squared.base = result;
        System.import('/build/framework/android/src/main.js').then(result => {
            android = result.default;
            squared.setFramework(android);
            const time = new Date().getTime();
            squared.parseDocument().then(function() {
                squared.settings.outputEmptyCopyDirectory = true;
                squared.copyTo('C:/Users/An/git/flexbox', {
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

System.import('/build/src/main.js').then(result => {
    squared = result;
    System.import('/build/src/base/main.js').then(result => {
        squared.base = result;
        System.import('/build/src/svg/main.js').then(result => {
            squared.svg = result;
            System.import('/build/framework/android/src/main.js').then(result => {
                android = result.default;
                squared.setFramework(android);
                const time = new Date().getTime();
                squared.parseDocument().then(function() {
                    squared.settings.outputEmptyCopyDirectory = true;
                    squared.copyTo('C:/Users/An/git/flexbox', {
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
    const copyTo = new URLSearchParams(location.search).get('copyTo');
    if (copyTo) {
        squared.settings.showErrorMessages = false;
    }
    squared.settings.customizationsBaseAPI = -1;
    const time = performance.now();
    squared.parseDocument()
        .then(() => {
            if (copyTo) {
                squared.copyTo(copyTo).then(response => {
                    squared.lib.dom.createElement('div', {
                        parent: document.body,
                        attributes: {
                            id: 'md5_complete',
                            innerHTML: response.files.map(item => item.name).join('\n')
                        },
                        style: {
                            whiteSpace: 'pre',
                            display: 'none'
                        }
                    });
                });
            }
            else {
                console.log('1: ' + (performance.now() - time));
                squared.settings.outputEmptyCopyDirectory = true;
                squared.copyTo('C:/Users/An/git/flexbox', {
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
                .then(response => {
                    console.log('2: ' + (performance.now() - time));
                    console.log(response);
                });
            }
        })
        .catch(err => console.log(err));
});