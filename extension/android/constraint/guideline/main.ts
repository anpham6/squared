import { WIDGET_NAME } from '../lib/constant';

import Guideline from './guideline';

const guideline = new Guideline(WIDGET_NAME.GUIDELINE, squared.base.lib.constant.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(guideline);
}

export default guideline;