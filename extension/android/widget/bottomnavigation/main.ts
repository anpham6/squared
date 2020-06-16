import BottomNavigation from './bottomnavigation';

import { WIDGET_NAME } from '../lib/constant';

const bottomNavigation = new BottomNavigation(WIDGET_NAME.BOTTOM_NAVIGATION, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.include(bottomNavigation);
}

export default bottomNavigation;