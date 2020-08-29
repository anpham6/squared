import Drawer from './drawer';

import { WIDGET_NAME } from '../lib/constant';

const drawer = new Drawer(WIDGET_NAME.DRAWER, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(drawer);
}

export default drawer;