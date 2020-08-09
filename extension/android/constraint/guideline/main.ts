import Guideline from './guideline';

import { WIDGET_NAME } from '../lib/constant';

const guideline = new Guideline(WIDGET_NAME.GUIDELINE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.include(guideline);
}

export default guideline;