import { WIDGET_NAME } from '../lib/constant';

import Menu from './menu';

const menu = new Menu(WIDGET_NAME.MENU, squared.base.lib.constant.APP_FRAMEWORK.ANDROID, { tagNames: ['NAV'] });

if (squared) {
    squared.add(menu);
}

export default menu;