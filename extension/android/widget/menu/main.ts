import Menu from './menu';

import { WIDGET_NAME } from '../lib/constant';

const menu = new Menu(WIDGET_NAME.MENU, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, ['NAV']);

if (squared) {
    squared.include(menu);
}

export default menu;