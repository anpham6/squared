import Application from './application';

import SETTINGS from './settings';

type NodeElement = squared.base.NodeElement;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.VDOM;

let initialized = false;
let application: Application<NodeElement>;

const appBase: squared.base.AppFramework<NodeElement> = {
    base: {
        Application
    },
    lib: {},
    extensions: {},
    system: {},
    create() {
        application = new Application<NodeElement>(framework, squared.base.NodeElement, squared.base.Controller);
        initialized = true;
        return {
            application,
            framework,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (initialized) {
            return {
                application,
                framework,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    }
};

export default appBase;