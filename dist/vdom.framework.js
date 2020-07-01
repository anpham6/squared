/* vdom-framework 1.13.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = global || self), (global.vdom = factory()));
})(this, function () {
    'use strict';

    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        insertNode(element, sessionId) {
            return element.nodeName !== '#text' ? new this.Node(this.nextId, sessionId, element) : undefined;
        }
    }

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
    };

    const framework = 1; /* VDOM */
    let initialized = false;
    let application;
    const appBase = {
        base: {
            Application,
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application(framework, squared.base.Node, squared.base.Controller);
            initialized = true;
            return {
                application,
                framework,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (initialized) {
                return {
                    application,
                    framework,
                    userSettings: application.userSettings,
                };
            }
            return appBase.create();
        },
    };

    return appBase;
});
