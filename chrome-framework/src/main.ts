import { UserSettings } from '../../src/base/@types/application';
import { ChromeFramework } from './@types/application';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import File from './file';
import Resource from './resource';
import View from './view';

import SETTINGS from './settings';

const $util = squared.lib.util;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let userSettings: UserSettings;
let elementMap: Map<Element, View>;

function findElement(element: HTMLElement, cache = true) {
    if (cache) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
    }
    const settings = application.userSettings;
    const preloadImages = settings.preloadImages;
    settings.preloadImages = false;
    application.parseDocument(element);
    settings.preloadImages = preloadImages;
    return elementMap.get(element) || null;
}

async function findElementAsync(element: HTMLElement, cache = true) {
    if (cache) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
    }
    await application.parseDocument(element);
    return elementMap.get(element) || null;
}

const appBase: ChromeFramework<View> = {
    base: {
        Application,
        ExtensionManager,
        Controller,
        File,
        Resource,
        View
    },
    lib: {},
    extensions: {},
    system: {
        getElement(element: HTMLElement, cache = true) {
            if (application) {
                return findElement(element, cache);
            }
            return null;
        },
        getElementById(value: string, cache = true) {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return findElement(element, cache);
                }
            }
            return null;
        },
        querySelector(value: string) {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return findElement(<HTMLElement> element);
                }
            }
            return null;
        },
        querySelectorAll(value: string) {
            const result: View[] = [];
            if (application) {
                document.querySelectorAll(value).forEach(element => {
                    const item = findElement(<HTMLElement> element);
                    if (item) {
                        result.push(item);
                    }
                });
            }
            return result;
        },
        getElementMap() {
            if (controller) {
                return controller.elementMap;
            }
            return new Map<Element, View>();
        },
        clearElementMap() {
            if (controller) {
                return controller.elementMap.clear();
            }
        }
    },
    create() {
        application = new Application(framework, View, Controller, Resource, ExtensionManager);
        controller = <Controller<View>> application.controllerHandler;
        application.resourceHandler.setFileHandler(new File());
        elementMap = controller.elementMap;
        userSettings = { ...SETTINGS };
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
    getElement: async (element: HTMLElement, cache = true) => {
        if (application) {
            return await findElementAsync(element, cache);
        }
        return null;
    },
    getElementById: async (value: string, cache = true) => {
        if (application) {
            const element = document.getElementById(value);
            if (element) {
                return await findElementAsync(element, cache);
            }
        }
        return null;
    },
    querySelector: async (value: string) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return await findElementAsync(<HTMLElement> element);
            }
        }
        return null;
    },
    querySelectorAll: async (value: string) => {
        if (application) {
            const query = document.querySelectorAll(value);
            const result: View[] = new Array(query.length);
            let incomplete = false;
            await (async () => {
                query.forEach(async (element, index) => {
                    const item = await findElementAsync(<HTMLElement> element);
                    if (item) {
                        result[index] = item;
                    }
                    else {
                        incomplete = true;
                    }
                });
            })();
            return incomplete ? $util.flatArray(result) : result;
        }
        return [];
    }
};

export default appBase;