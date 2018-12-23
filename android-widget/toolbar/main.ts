import { WIDGET_NAME } from '../lib/constant';

import Toolbar from './toolbar';

const toolbar = new Toolbar(WIDGET_NAME.TOOLBAR, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.includeAsync(toolbar);
}

export default toolbar;