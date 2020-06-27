import Application from './application';

import SETTINGS from './settings';

type Node = squared.base.Node;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.VDOM;

let initialized = false;
let application: Application<Node>;

const appBase: squared.base.AppFramework<Node> = {
    base: {
        Application
    },
    lib: {},
    extensions: {},
    system: {},
    create() {
        application = new Application<Node>(framework, squared.base.Node, squared.base.Controller);
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