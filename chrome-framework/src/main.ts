import { UserSettings } from '../../src/base/@types/application';
import { ChromeFramework } from './@types/application';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import Resource from './resource';
import View from './view';

import SETTINGS from './settings';

type T = View;

const $util = squared.lib.util;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<T>;
let controller: Controller<T>;
let userSettings: UserSettings;
let elementMap: Map<Element, T>;

function findElement(element: HTMLElement) {
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

async function findElementAsync(element: HTMLElement) {
    const result = elementMap.get(element);
    if (result) {
        return result;
    }
    await application.parseDocument(element);
    return elementMap.get(element) || null;
}

const appBase: ChromeFramework<T> = {
    base: {
        Controller,
        Resource,
        View
    },
    lib: {},
    extensions: {},
    system: {
        getElement(element: HTMLElement) {
            if (application) {
                return findElement(element);
            }
            return null;
        },
        getElementById(value: string) {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return findElement(element);
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
            const result: T[] = [];
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
            if (application) {
                return (<Controller<T>> application.controllerHandler).elementMap;
            }
            return new Map<Element, T>();
        }
    },
    create() {
        application = new Application(framework, View, Controller, Resource, ExtensionManager);
        controller = <Controller<T>> application.controllerHandler;
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
    getElement: async (element: HTMLElement) => {
        if (application) {
            return await findElementAsync(element);
        }
        return null;
    },
    getElementById: async (value: string) => {
        if (application) {
            const element = document.getElementById(value);
            if (element) {
                return await findElementAsync(element);
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