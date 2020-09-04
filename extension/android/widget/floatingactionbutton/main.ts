import { WIDGET_NAME } from '../lib/constant';

import FloatingActionButton from './floatingactionbutton';

const fab = new FloatingActionButton(WIDGET_NAME.FAB, squared.base.lib.constant.APP_FRAMEWORK.ANDROID, { tagNames: ['BUTTON', 'INPUT', 'IMG'] });

if (squared) {
    squared.add(fab);
}

export default fab;