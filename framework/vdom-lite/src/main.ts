import Application from './application';
import Controller from '../../../src/base/controller';
import Node from '../../../src/base/node';

import SETTINGS from '../../vdom/src/settings';

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
            squared.base.lib.enumeration.APP_FRAMEWORK.VDOM,
            Node,
            (Controller as unknown) as Constructor<Node>
        );
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