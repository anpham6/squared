import Toolbar from './toolbar';

import { WIDGET_NAME } from '../lib/constant';

const toolbar = new Toolbar(WIDGET_NAME.TOOLBAR, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.include(toolbar);
}

export default toolbar;