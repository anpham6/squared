import { WIDGET_NAME } from '../lib/constant';

import Toolbar from './toolbar';

const toolbar = new Toolbar(WIDGET_NAME.TOOLBAR, squared.base.lib.constant.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(toolbar);
}

export default toolbar;