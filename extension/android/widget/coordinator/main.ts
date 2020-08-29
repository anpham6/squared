import Coordinator from './coodinator';

import { WIDGET_NAME } from '../lib/constant';

const coordinator = new Coordinator(WIDGET_NAME.COORDINATOR, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(coordinator);
}

export default coordinator;