import { WIDGET_NAME } from '../lib/constant';

import BottomNavigation from './bottomnavigation';

const bottomNavigation = new BottomNavigation(WIDGET_NAME.BOTTOM_NAVIGATION, squared.base.lib.constant.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.add(bottomNavigation);
}

export default bottomNavigation;