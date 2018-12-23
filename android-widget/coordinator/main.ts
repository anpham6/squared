import { WIDGET_NAME } from '../lib/constant';

import Coordinator from './coodinator';

const coordinator = new Coordinator(WIDGET_NAME.COORDINATOR, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.includeAsync(coordinator);
}

export default coordinator;