import Menu from './menu';

import { WIDGET_NAME } from '../lib/constant';

const menu = new Menu(WIDGET_NAME.MENU, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, { tagNames: ['NAV'] });

if (squared) {
    squared.add(menu);
}

export default menu;