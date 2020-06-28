import Application from './application';
import Controller from '../../../src/base/controller';
import Node from '../../../src/base/node';

import SETTINGS from '../../vdom/src/settings';

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
        application = new Application<Node>(framework, Node, (Controller as unknown) as Constructor<Node>);
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