import { DOM } from './regex';

const { STRING } = squared.lib.regex;

const { calculateVar, getFontSize, isCalc, isLength, parseUnit } = squared.lib.css;
const { isString, iterateArray, resolvePath, splitSome } = squared.lib.util;

const REGEXP_SOURCESIZES = new RegExp(`^((?:\\s*(?:and\\s+)?(?:\\(\\s*)?\\(\\s*(?:orientation\\s*:\\s*(?:portrait|landscape)|(?:max|min)-width\\s*:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\)(?:\\s*\\))?)+)?\\s*(.*)$`, 'i');

function getAspectRatio(element: HTMLImageElement | HTMLSourceElement) {
    if (element.width && element.height) {
        return element.width / element.height;
    }
}

export function getSrcSet(element: HTMLImageElement, mimeType?: MIMEOrAll) {
    const result: ImageSrcSet[] = [];
    const parentElement = element.parentElement as HTMLPictureElement;
    let { srcset, sizes } = element,
        aspectRatio = getAspectRatio(element);
    if (parentElement && parentElement.tagName === 'PICTURE') {
        iterateArray(parentElement.children, (item: HTMLSourceElement) => {
            if (item.tagName === 'SOURCE' && !(isString(item.media) && !window.matchMedia(item.media).matches) && (!item.type || !mimeType || mimeType === '*' || mimeType.includes(item.type.trim().toLowerCase()))) {
                ({ srcset, sizes } = item);
                aspectRatio = getAspectRatio(item);
                return true;
            }
        });
    }
    if (srcset) {
        splitSome(srcset, value => {
            const match = DOM.SRCSET.exec(value);
            if (match) {
                let width = 0,
                    pixelRatio = 1;
                if (match[3]) {
                    if (match[3].toLowerCase() === 'w') {
                        width = +match[2];
                        pixelRatio = 0;
                    }
                    else {
                        pixelRatio = +match[2];
                    }
                }
                result.push({ src: resolvePath(match[1].split(/\s+/)[0]), pixelRatio, width, aspectRatio });
            }
        });
    }
    const length = result.length;
    if (length === 0) {
        return;
    }
    result.sort((a, b) => {
        const pxA = a.pixelRatio;
        const pxB = b.pixelRatio;
        if (pxA && pxB) {
            if (pxA !== pxB) {
                return pxA - pxB;
            }
        }
        else {
            const widthA = a.width;
            const widthB = b.width;
            if (widthA !== widthB && widthA && widthB) {
                return widthA - widthB;
            }
        }
        return 0;
    });
    if (sizes) {
        const options: UnitOptions = { fontSize: getFontSize(element) };
        let width = NaN;
        splitSome(sizes, value => {
            const match = REGEXP_SOURCESIZES.exec(value);
            if (match) {
                const query = match[1];
                const unit = match[3];
                if (!unit || query && !window.matchMedia(/^\(\s*(\(.+\))\s*\)$/.exec(query)?.[1] || query).matches) {
                    return;
                }
                if (isCalc(unit)) {
                    width = calculateVar(element, unit, options);
                }
                else if (isLength(unit)) {
                    width = parseUnit(unit, options);
                }
                if (!isNaN(width)) {
                    return true;
                }
            }
        });
        if (!isNaN(width)) {
            if (length > 1) {
                const resolution = width * window.devicePixelRatio;
                let index = -1;
                for (let i = 0; i < length; ++i) {
                    const imageWidth = result[i].width;
                    if (imageWidth > 0 && imageWidth <= resolution && (index === -1 || result[index].width < imageWidth)) {
                        index = i;
                    }
                }
                if (index > 0) {
                    result.unshift(result.splice(index, 1)[0]);
                }
                for (let i = 1; i < length; ++i) {
                    const item = result[i];
                    if (item.pixelRatio === 0) {
                        item.pixelRatio = item.width / width;
                    }
                }
            }
            const item = result[0];
            item.pixelRatio = 1;
            item.actualWidth = width;
        }
    }
    return result;
}