import APP_FRAMEWORK = squared.base.lib.constant.APP_FRAMEWORK;

import Application from './application';
import Controller from '../../../src/base/controller';
import Node from '../../../src/base/node';

import SETTINGS from '../../vdom/src/settings';

let application: Null<Application<Node>> = null;

const appBase: squared.base.AppFramework<Node> = {
    create() {
        application = new Application<Node>(
            APP_FRAMEWORK.VDOM,
            Node,
            Controller
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