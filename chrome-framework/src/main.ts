import { AppFramework, UserSettings } from '../../src/base/@types/application';

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
    application.parseDocument(element);
    return controller.elementMap.get(element) || null;
}

const appBase: AppFramework<T> = {
    base: {
        Controller,
        Resource,
        View
    },
    lib: {},
    extensions: {},
    system: {
        getElement(element: HTMLElement): View | null {
            if (application && element) {
                return findElement(element);
            }
            return null;
        },
        getElementById(value: string): View | null {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return findElement(element);
                }
            }
            return null;
        },
        querySelector(value: string): View | null {
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
    }
};

export default appBase;