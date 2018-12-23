import { WIDGET_NAME } from '../lib/constant';

import BottomNavigation from './bottomnavigation';

const bottomNavigation = new BottomNavigation(WIDGET_NAME.BOTTOM_NAVIGATION, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID);

if (squared) {
    squared.includeAsync(bottomNavigation);
}

export default bottomNavigation;