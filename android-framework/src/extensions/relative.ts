import type { ControllerSettingsAndroid } from '../../../@types/android/application';

type View = android.base.View;

const { BOX_STANDARD } = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.Relative<T> {
    public is(node: T) {
        if (node.inlineStatic || node.imageOrSvgElement) {
            switch (node.verticalAlign) {
                case 'sub':
                case 'super':
                    return true;
            }
        }
        return super.is(node);
    }

    public postOptimize(node: T) {
        if (!node.baselineAltered) {
            switch (node.verticalAlign) {
                case 'sub': {
                    const renderParent = node.outerMostWrapper.renderParent as T;
                    if (!renderParent.layoutHorizontal) {
                        node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.floor(node.baselineHeight * (<ControllerSettingsAndroid> this.controller.localSettings).deviations.subscriptBottomOffset) * -1);
                    }
                    break;
                }
                case 'super': {
                    const renderParent = node.outerMostWrapper.renderParent as T;
                    if (!renderParent.layoutHorizontal) {
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(node.baselineHeight * (<ControllerSettingsAndroid> this.controller.localSettings).deviations.superscriptTopOffset) * -1);
                    }
                    break;
                }
            }
        }
        super.postOptimize(node);
    }
}