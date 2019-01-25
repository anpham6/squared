import FloatingActionButton from './floatingactionbutton';

import { WIDGET_NAME } from '../lib/constant';

const fab = new FloatingActionButton(WIDGET_NAME.FAB, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, ['BUTTON', 'INPUT', 'IMG']);

if (squared) {
    squared.includeAsync(fab);
}

export default fab;