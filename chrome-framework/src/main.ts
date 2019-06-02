import { UserSettings } from '../../src/base/@types/application';
import { ChromeFramework } from './@types/application';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import Resource from './resource';
import View from './view';

import SETTINGS from './settings';

type T = View;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<T>;
let controller: Controller<T>;
let userSettings: UserSettings;

function findElement(element: HTMLElement) {
    const result = controller.elementMap.get(element);
    if (result) {
        return result;
    }
    const preloadImages = application.userSettings.preloadImages;
    application.userSettings.preloadImages = false;
    application.parseDocument(element);
    application.userSettings.preloadImages = preloadImages;
    return controller.elementMap.get(element) || null;
}

async function findElementAsync(element: HTMLElement) {
    const result = controller.elementMap.get(element);
    if (result) {
        return result;
    }
    await application.parseDocument(element);
    return controller.elementMap.get(element) || null;
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
            if (application && element) {
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
            if (application) {
                return (<Controller<T>> application.controllerHandler).elementMap;
            }
            return new Map<Element, View>();
        }
    },
    create() {
        application = new Application(framework, View, Controller, Resource, ExtensionManager);
        controller = <Controller<T>> application.controllerHandler;
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
        if (application && element) {
            return findElementAsync(element);
        }
        return null;
    },
    getElementById: async (value: string) => {
        if (application) {
            const element = document.getElementById(value);
            if (element) {
                return findElementAsync(element);
            }
        }
        return null;
    },
    querySelector: async (value: string) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return findElementAsync(<HTMLElement> element);
            }
        }
        return null;
    },
    querySelectorAll: async (value: string) => {
        const result: View[] = [];
        if (application) {
            document.querySelectorAll(value).forEach(async element => {
                const item = await findElementAsync(<HTMLElement> element);
                if (item) {
                    result.push(item);
                }
            });
        }
        return result;
    }
};

export default appBase;