/* vdom-framework 2.3.2
   https://github.com/anpham6/squared */

var vdom = (function () {
    'use strict';

    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        init() { }
        insertNode(processing, element) {
            if (element.nodeName[0] !== '#') {
                return new this.Node(this.nextId, processing.sessionId, element);
            }
        }
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
            Application
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application(1 /* VDOM */, squared.base.Node, squared.base.Controller, squared.base.ExtensionManager);
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
