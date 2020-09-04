import Application from './application';
import Controller from '../../../src/base/controller';
import Node from '../../../src/base/node';

import SETTINGS from '../../vdom/src/settings';

const framework = squared.base.lib.constant.APP_FRAMEWORK.VDOM;
let application: Null<Application<Node>> = null;

const appBase: squared.base.AppFramework<Node> = {
    create() {
        application = new Application<Node>(
            framework,
            Node,
            (Controller as unknown) as Constructor<Node>
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
        return appBase.create();
    }
};

export default appBase;