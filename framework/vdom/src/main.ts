import Application from './application';

import SETTINGS from './settings';

type Node = squared.base.Node;

const framework = squared.base.lib.constant.APP_FRAMEWORK.VDOM;
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
            framework,
            squared.base.Node,
            squared.base.Controller,
            squared.base.ExtensionManager
        );
        return {
            application,
            framework,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework,
                userSettings: application.userSettings
            };
        }
        return this.create();
    }
};

export default appBase;