import { WIDGET_NAME } from '../lib/constant';

import Menu from './menu';

const menu = new Menu(WIDGET_NAME.MENU, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, ['NAV']);

if (squared) {
    squared.includeAsync(menu);
}

export default menu;