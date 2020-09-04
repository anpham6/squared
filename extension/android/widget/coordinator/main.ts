import { WIDGET_NAME } from '../lib/constant';

import Coordinator from './coodinator';

const coordinator = new Coordinator(WIDGET_NAME.COORDINATOR, squared.base.lib.constant.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(coordinator);
}

export default coordinator;