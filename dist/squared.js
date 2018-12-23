/* squared 0.1.0
   https://github.com/anpham6/squared */

var squared = (function (exports) {
    'use strict';

    exports.settings = {};
    exports.system = {};
    const extensionsAsync = new Set();
    const optionsAsync = new Map();
    let main;
    let framework;
    function setFramework(value, cached = false) {
        if (framework !== value) {
            const appBase = cached ? value.cached() : value.create();
            exports.settings = appBase.userSettings;
            main = appBase.application;
            main.userSettings = appBase.userSettings;
            if (Array.isArray(exports.settings.builtInExtensions)) {
                const register = new Set();
                for (let namespace of exports.settings.builtInExtensions) {
                    namespace = namespace.trim();
                    if (main.builtInExtensions[namespace]) {
                        register.add(main.builtInExtensions[namespace]);
                    }
                    else {
                        for (const ext in main.builtInExtensions) {
                            if (ext.startsWith(`${namespace}.`)) {
                                register.add(main.builtInExtensions[ext]);
                            }
                        }
                    }
                }
                register.forEach(item => main.extensionManager.include(item));
            }
            framework = value;
            exports.system = value.system;
        }
        reset();
    }
    function parseDocument(...elements) {
        if (main && !main.closed) {
            if (exports.settings.handleExtensionsAsync) {
                extensionsAsync.forEach(item => main.extensionManager.include(item));
                for (const [name, options] of optionsAsync.entries()) {
                    configure(name, options);
                }
                extensionsAsync.clear();
                optionsAsync.clear();
            }
            return main.parseDocument(...elements);
        }
        return {
            then: (callback) => {
                if (!main) {
                    alert('ERROR: Framework not installed.');
                }
                else if (main.closed) {
                    if (confirm('ERROR: Document is closed. Reset and rerun?')) {
                        main.reset();
                        parseDocument.call(null, ...arguments).then(callback);
                    }
                }
            }
        };
    }
    function include(value) {
        if (main) {
            if (value instanceof squared.base.Extension) {
                return main.extensionManager.include(value);
            }
            else if (typeof value === 'string') {
                value = value.trim();
                const ext = main.builtInExtensions[value] || retrieve(value);
                if (ext) {
                    return main.extensionManager.include(ext);
                }
            }
        }
        return false;
    }
    function includeAsync(value) {
        if (include(value)) {
            return true;
        }
        else if (value instanceof squared.base.Extension) {
            extensionsAsync.add(value);
            if (exports.settings.handleExtensionsAsync) {
                return true;
            }
        }
        return false;
    }
    function exclude(value) {
        if (main) {
            if (value instanceof squared.base.Extension) {
                if (extensionsAsync.has(value)) {
                    extensionsAsync.delete(value);
                    main.extensionManager.exclude(value);
                    return true;
                }
                else {
                    return main.extensionManager.exclude(value);
                }
            }
            else if (typeof value === 'string') {
                value = value.trim();
                const ext = main.extensionManager.retrieve(value);
                if (ext) {
                    return main.extensionManager.exclude(ext);
                }
            }
        }
        return false;
    }
    function configure(value, options) {
        if (typeof options === 'object') {
            if (value instanceof squared.base.Extension) {
                Object.assign(value.options, options);
                return true;
            }
            else if (typeof value === 'string') {
                if (main) {
                    value = value.trim();
                    const ext = main.extensionManager.retrieve(value) || Array.from(extensionsAsync).find(item => item.name === value);
                    if (ext) {
                        Object.assign(ext.options, options);
                        return true;
                    }
                    else {
                        optionsAsync.set(value, options);
                        if (exports.settings.handleExtensionsAsync) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    function apply(value, options) {
        if (value instanceof squared.base.Extension) {
            return include(value);
        }
        else if (typeof value === 'string') {
            value = value.trim();
            if (typeof options === 'object') {
                return configure(value, options);
            }
            else {
                return retrieve(value);
            }
        }
        return false;
    }
    function retrieve(value) {
        return main && main.extensionManager.retrieve(value);
    }
    function ready() {
        return main && !main.initialized && !main.closed;
    }
    function close() {
        if (main && !main.initialized && main.size) {
            main.finalize();
        }
    }
    function reset() {
        if (main) {
            main.reset();
        }
    }
    function saveAllToDisk() {
        if (main && !main.initialized && main.size) {
            if (!main.closed) {
                main.finalize();
            }
            main.saveAllToDisk();
        }
    }
    function toString() {
        return main ? main.toString() : '';
    }

    exports.setFramework = setFramework;
    exports.parseDocument = parseDocument;
    exports.include = include;
    exports.includeAsync = includeAsync;
    exports.exclude = exclude;
    exports.configure = configure;
    exports.apply = apply;
    exports.retrieve = retrieve;
    exports.ready = ready;
    exports.close = close;
    exports.reset = reset;
    exports.saveAllToDisk = saveAllToDisk;
    exports.toString = toString;

    return exports;

}({}));
