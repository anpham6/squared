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
let userSettings: UserSettings;

const appBase: AppFramework<T> = {
    base: {
        Controller,
        Resource,
        View
    },
    lib: {},
    extensions: {},
    system: {
        getElement(element: HTMLElement | string) {
            if (typeof element === 'string') {
                element = <HTMLElement> document.getElementById(element);
            }
            if (element && application) {
                const controller = <chrome.base.Controller<T>> application.controllerHandler;
                let result = controller.elementMap.get(element);
                if (result === undefined) {
                    application.parseDocument(element);
                    result = controller.elementMap.get(element);
                }
                return result;
            }
            return undefined;
        },
        getElementMap() {
            if (application) {
                return (<chrome.base.Controller<T>> application.controllerHandler).elementMap;
            }
            return undefined;
        }
    },
    create() {
        application = new Application(framework, View, Controller, Resource, ExtensionManager);
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