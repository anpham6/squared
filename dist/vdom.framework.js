/* vdom-framework 1.11.0
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
            this.builtInExtensions = {};
            this.extensions = [];
            this.systemName = 'vdom';
        }
    }

    class Controller extends squared.base.Controller {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
            this.localSettings = {
                mimeType: {
                    font: '*',
                    image: '*',
                    audio: '*',
                    video: '*',
                },
            };
        }
    }

    const settings = {
        builtInExtensions: [],
        createQuerySelectorMap: true,
        showErrorMessages: false,
    };

    const framework = 1; /* VDOM */
    let initialized = false;
    let application;
    const appBase = {
        base: {
            Application,
            Controller,
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application(framework, squared.base.NodeElement, Controller);
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
