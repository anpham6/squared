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

const isFullScreen = (node: View) => node.visibleStyle.borderWidth && (node.backgroundColor !== '' || (<HTMLBodyElement> node.element).scrollHeight < window.innerHeight) && node.css('height') !== '100%' && node.css('minHeight') !== '100%';

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T) {
        if (node.documentBody) {
            if (isFullScreen(node)) {
                return true;
            }
            else {
                const scrollHeight = (<HTMLBodyElement> node.element).scrollHeight;
                const backgroundImage = $ResourceUI.parseBackgroundImage(node);
                if (backgroundImage) {
                    const backgroundRepeat = node.css('backgroundRepeat').split($regex.XML.SEPARATOR);
                    for (let i = 0; i < backgroundImage.length; i++) {
                        const image = backgroundImage[i];
                        if (typeof image === 'string' && image.startsWith('url(')) {
                            const repeat = backgroundRepeat[i];
                            if (repeat !== 'repeat' && repeat !== 'repeat-y') {
                                const asset = <ImageAsset> (this.resource.getRawData(image) || this.resource.getImage($css.resolveURL(image)));
                                if (asset) {
                                    const height = asset.height;
                                    if (height > 0 && height < scrollHeight) {
                                        return true;
                                    }
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
        container.visibleStyle.background = true;
        container.setLayoutWidth('match_parent');
        const fullScreen = isFullScreen(node);
        const height = parent.cssInitial('height');
        const minHeight = parent.cssInitial('minHeight');
        let backgroundSize = node.css('backgroundSize');
        if (height === '' && minHeight === '') {
            container.setLayoutHeight(fullScreen ? 'match_parent' : 'wrap_content');
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
        const backgroundImage = node.backgroundImage;
        container.cssApply({
            backgroundImage,
            backgroundSize,
            backgroundRepeat: node.css('backgroundRepeat'),
            backgroundPositionX: node.css('backgroundPositionX'),
            backgroundPositionY: node.css('backgroundPositionY'),
            backgroundClip: node.css('backgroundClip'),
            border: '0px none solid',
            borderRadius: '0px'
        });
        container.setCacheValue('backgroundImage', backgroundImage);
        if (fullScreen) {
            const backgroundColor = node.backgroundColor;
            if (backgroundColor !== '') {
                container.css('backgroundColor', backgroundColor);
                container.setCacheValue('backgroundColor', backgroundColor);
                node.css('backgroundColor', 'transparent');
                node.setCacheValue('backgroundColor', '');
            }
        }
        container.unsetCache('visibleStyle');
        container.unsafe('excludeResource', $e.NODE_RESOURCE.BOX_SPACING);
        node.setCacheValue('backgroundImage', '');
        node.unsetCache('visibleStyle');
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