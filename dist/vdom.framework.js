/* vdom-framework 2.0.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), (global.vdom = factory()));
})(this, function () {
    'use strict';

    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        init() {}
        insertNode(element, sessionId) {
            if (element.nodeName[0] !== '#') {
                return new this.Node(this.nextId, sessionId, element);
            }
        }
    }

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
    };

    let application = null;
    const appBase = {
        base: {
            Application,
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application(
                1 /* VDOM */,
                squared.base.Node,
                squared.base.Controller,
                squared.base.ExtensionManager
            );
            return {
                application,
                framework: 1 /* VDOM */,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 1 /* VDOM */,
                    userSettings: application.userSettings,
                };
            }
            return this.create();
        },
    };

    return appBase;
});
