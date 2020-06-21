import Application from './application';
import Controller from '../../../src/base/controller';
import NodeElement from '../../../src/base/node-element';

import SETTINGS from './settings';

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
        application = new Application<NodeElement>(framework, NodeElement, (Controller as unknown) as Constructor<NodeElement>);
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