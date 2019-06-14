/* chrome-framework 1.0.0
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    class View extends squared.base.Node {
        constructor(id, sessionId, element, afterInit) {
            super(id, sessionId, element);
            this._cached = {};
            if (element) {
                this.init();
            }
            if (afterInit) {
                afterInit(this);
            }
        }
    }

    class Application extends squared.base.Application {
        insertNode(element, parent) {
            if (element.nodeName === '#text') {
                if (this.userSettings.excludePlainText) {
                    return undefined;
                }
                this.controllerHandler.applyDefaultStyles(element);
            }
            const node = this.createNode(element, false);
            if (node.plainText) {
                View.copyTextStyle(node, parent);
            }
            return node;
        }
        afterCreateCache() {
            if (this.processing.node) {
                this.controllerHandler.addElementList(this.processing.cache);
            }
        }
    }

    const $const = squared.lib.constant;
    const $session = squared.lib.session;
    class Controller extends squared.base.Controller {
        constructor() {
            super(...arguments);
            this.localSettings = {
                svg: {
                    enabled: true
                },
                supported: {
                    fontFormat: '*',
                    imageFormat: '*'
                },
                unsupported: {
                    cascade: new Set(),
                    tagName: new Set(),
                    excluded: new Set()
                }
            };
            this._elementMap = new Map();
        }
        init() { }
        sortInitialCache() { }
        reset() {
            this._elementMap.clear();
        }
        applyDefaultStyles(element) {
            if (element.nodeName === '#text') {
                $session.setElementCache(element, 'styleMap', this.application.processing.sessionId, {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: $const.CSS.NONE,
                    clear: $const.CSS.NONE
                });
            }
        }
        includeElement() {
            return true;
        }
        addElement(node) {
            this._elementMap.set(node.element, node);
        }
        addElementList(list) {
            for (const node of list) {
                this._elementMap.set(node.element, node);
            }
        }
        get elementMap() {
            return this._elementMap;
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    class ExtensionManager extends squared.base.ExtensionManager {
    }

    class Resource extends squared.base.Resource {
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const settings = {
        builtInExtensions: [],
        preloadImages: false,
        handleExtensionsAsync: true,
        showErrorMessages: false,
        createQuerySelectorMap: true,
        excludePlainText: true
    };

    const $util = squared.lib.util;
    const framework = 4 /* CHROME */;
    let initialized = false;
    let application;
    let controller;
    let userSettings;
    let elementMap;
    function findElement(element) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
        const settings = application.userSettings;
        const preloadImages = settings.preloadImages;
        settings.preloadImages = false;
        application.parseDocument(element);
        settings.preloadImages = preloadImages;
        return elementMap.get(element) || null;
    }
    function findElementAsync(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = elementMap.get(element);
            if (result) {
                return result;
            }
            yield application.parseDocument(element);
            return elementMap.get(element) || null;
        });
    }
    const appBase = {
        base: {
            Controller,
            Resource,
            View
        },
        lib: {},
        extensions: {},
        system: {
            getElement(element) {
                if (application) {
                    return findElement(element);
                }
                return null;
            },
            getElementById(value) {
                if (application) {
                    const element = document.getElementById(value);
                    if (element) {
                        return findElement(element);
                    }
                }
                return null;
            },
            querySelector(value) {
                if (application) {
                    const element = document.querySelector(value);
                    if (element) {
                        return findElement(element);
                    }
                }
                return null;
            },
            querySelectorAll(value) {
                const result = [];
                if (application) {
                    document.querySelectorAll(value).forEach(element => {
                        const item = findElement(element);
                        if (item) {
                            result.push(item);
                        }
                    });
                }
                return result;
            },
            getElementMap() {
                if (application) {
                    return application.controllerHandler.elementMap;
                }
                return new Map();
            }
        },
        create() {
            application = new Application(framework, View, Controller, Resource, ExtensionManager);
            controller = application.controllerHandler;
            elementMap = controller.elementMap;
            userSettings = Object.assign({}, settings);
            initialized = true;
            return {
                application,
                framework,
                userSettings
            };
        },
        cached() {
            if (initialized) {
                return {
                    application,
                    framework,
                    userSettings
                };
            }
            return appBase.create();
        },
        getElement: (element) => __awaiter(undefined, void 0, void 0, function* () {
            if (application) {
                return yield findElementAsync(element);
            }
            return null;
        }),
        getElementById: (value) => __awaiter(undefined, void 0, void 0, function* () {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return yield findElementAsync(element);
                }
            }
            return null;
        }),
        querySelector: (value) => __awaiter(undefined, void 0, void 0, function* () {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return yield findElementAsync(element);
                }
            }
            return null;
        }),
        querySelectorAll: (value) => __awaiter(undefined, void 0, void 0, function* () {
            if (application) {
                const query = document.querySelectorAll(value);
                const result = new Array(query.length);
                let incomplete = false;
                yield (() => __awaiter(this, void 0, void 0, function* () {
                    query.forEach((element, index) => __awaiter(this, void 0, void 0, function* () {
                        const item = yield findElementAsync(element);
                        if (item) {
                            result[index] = item;
                        }
                        else {
                            incomplete = true;
                        }
                    }));
                }))();
                return incomplete ? $util.flatArray(result) : result;
            }
            return [];
        })
    };

    return appBase;

}());
