/* vdom-framework 2.5.12
   https://github.com/anpham6/squared */

var vdom = (function () {
    'use strict';

    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        insertNode(processing, element) {
            if (element.nodeName[0] !== '#') {
                return new this.Node(this.nextId, processing.sessionId, element);
            }
        }
    }

    class Node extends squared.base.Node {
    }

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        pierceShadowRoot: false,
        showErrorMessages: false
    };

    let application = null;
    const appBase = {
        base: {
            Application,
            Node
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application(1 /* VDOM */, Node, squared.base.Controller, squared.base.ExtensionManager);
            return {
                application,
                framework: 1 /* VDOM */,
                userSettings: Object.assign({}, settings)
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 1 /* VDOM */,
                    userSettings: application.userSettings
                };
            }
            return this.create();
        }
    };

    return appBase;

}());
