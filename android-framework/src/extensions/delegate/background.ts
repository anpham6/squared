import { ImageAsset } from '../../../../@types/base/application';

import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $LayoutUI = squared.base.LayoutUI;
import $ResourceUI = squared.base.ResourceUI;

const {
    css: $css,
    regex: $regex
} = squared.lib;

const $e = squared.base.lib.enumeration;

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T) {
        if (node.documentBody) {
            const backgroundImage = $ResourceUI.parseBackgroundImage(node);
            if (backgroundImage) {
                const backgroundRepeat = node.css('backgroundRepeat').split($regex.XML.SEPARATOR);
                const backgroundPositionY = node.css('backgroundPositionY').split($regex.XML.SEPARATOR);
                for (let i = 0; i < backgroundImage.length; i++) {
                    const image = backgroundImage[i];
                    if (typeof image === 'string' && image.startsWith('url(')) {
                        const repeat = backgroundRepeat[i];
                        const position = backgroundPositionY[i];
                        if (repeat !== 'repeat' && repeat !== 'repeat-y' && position !== 'top' && !/^0[^0]*$/.test(position)) {
                            const scrollHeight = (<HTMLBodyElement> node.element).scrollHeight;
                            if (scrollHeight < window.innerHeight) {
                                return true;
                            }
                            else {
                                const asset = <ImageAsset> (this.resource.getRawData(image) || this.resource.getImage($css.resolveURL(image)));
                                if (asset && asset.height < scrollHeight) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent);
        container.style = node.style;
        container.unsafe('element', document.createElement('div'));
        container.unsetCache('htmlElement');
        const backgroundImage = node.backgroundImage;
        container.setCacheValue('backgroundImage', backgroundImage);
        container.unsafe('excludeResource', $e.NODE_RESOURCE.BOX_SPACING);
        container.setLayoutWidth('match_parent');
        const height = parent.cssInitial('height');
        const minHeight = parent.cssInitial('minHeight');
        let backgroundSize = node.css('backgroundSize');
        if (height === '' && minHeight === '') {
            container.setLayoutHeight('wrap_content');
        }
        else {
            if (height !== '100%' && minHeight !== '100%') {
                const offsetHeight = (<HTMLHtmlElement> parent.element).offsetHeight;
                if (offsetHeight < window.innerHeight) {
                    backgroundSize = `auto ${offsetHeight}px`;
                }
            }
            container.setLayoutHeight('match_parent');
        }
        container.cssApply({
            backgroundImage,
            backgroundSize,
            backgroundRepeat: node.css('backgroundRepeat'),
            backgroundPositionX: node.css('backgroundPositionX'),
            backgroundPositionY: node.css('backgroundPositionY'),
            backgroundClip: node.css('backgroundClip'),
            border: '0px none solid',
            borderRadius: '0px',
        });
        node.setCacheValue('backgroundImage', '');
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.FRAME,
                    $e.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }
}