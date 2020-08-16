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
        application = new Application<Node>(squared.base.lib.enumeration.APP_FRAMEWORK.VDOM, squared.base.Node, squared.base.Controller);
        return {
            application,
            framework: squared.base.lib.enumeration.APP_FRAMEWORK.VDOM,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: squared.base.lib.enumeration.APP_FRAMEWORK.VDOM,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    }
};

export default appBase;