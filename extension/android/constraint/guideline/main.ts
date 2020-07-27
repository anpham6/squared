import Guideline from './guideline';

import { WIDGET_NAME } from '../lib/constant';

const gideline = new Guideline(WIDGET_NAME.GUIDELINE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.include(gideline);
}

export default gideline;