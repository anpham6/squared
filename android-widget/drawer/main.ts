import { WIDGET_NAME } from '../lib/constant';

import Drawer from './drawer';

const drawer = new Drawer(WIDGET_NAME.DRAWER, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.includeAsync(drawer);
}

export default drawer;