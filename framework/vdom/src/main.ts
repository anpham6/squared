import APP_FRAMEWORK = squared.base.lib.constant.APP_FRAMEWORK;

import Application from './application';

import SETTINGS from './settings';

type Node = squared.base.Node;

let application: Null<Application<Node>> = null;

const appBase: squared.base.AppFramework<Node> = {
    base: {
        Application
    },
    lib: {},
    extensions: {},
    system: {},
    create() {
        application = new Application<Node>(
            APP_FRAMEWORK.VDOM,
            squared.base.Node,
            squared.base.Controller,
            squared.base.ExtensionManager
        );
        return {
            application,
            framework: APP_FRAMEWORK.VDOM,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: APP_FRAMEWORK.VDOM,
                userSettings: application.userSettings
            };
        }
        return this.create();
    }
};

export default appBase;