const { TRANSFORM } = squared.lib.regex;

const { asPercent, isPercent, convertAngle, parseUnit } = squared.lib.css;
const { splitEnclosing, splitPair, splitSome, startsWith } = squared.lib.util;

export function getKeyframesRules(documentRoot: DocumentOrShadowRoot = document): KeyframesMap {
    const result = new Map<string, KeyframeData>();
    const styleSheets = documentRoot.styleSheets;
    for (let i = 0, length = styleSheets.length; i < length; ++i) {
        try {
            const cssRules = styleSheets[i].cssRules;
            if (cssRules) {
                for (let j = 0, q = cssRules.length; j < q; ++j) {
                    try {
                        const item = cssRules[j] as CSSKeyframesRule;
                        if (item.type === CSSRule.KEYFRAMES_RULE) {
                            const value = parseKeyframes(item.cssRules);
                            if (value) {
                                const data = result.get(item.name);
                                if (data) {
                                    Object.assign(data, value);
                                }
                                else {
                                    result.set(item.name, value);
                                }
                            }
                        }
                    }
                    catch {
                    }
                }
            }
        }
        catch {
        }
    }
    return result;
}

export function parseKeyframes(rules: CSSRuleList) {
    const result: KeyframeData = {};
    let valid: Undef<boolean>;
    for (let i = 0, length = rules.length; i < length; ++i) {
        const item = rules[i] as CSSKeyframeRule;
        const values = splitEnclosing(item.cssText, '', true, '{', '}');
        const items = values[1].trim().split(';');
        items.pop();
        splitSome(item.keyText || values[0], percent => {
            switch (percent) {
                case 'from':
                    percent = '0%';
                    break;
                case 'to':
                    percent = '100%';
                    break;
            }
            const keyframe: StringMap = {};
            for (let j = 0, q = items.length; j < q; ++j) {
                const [attr, value] = splitPair(items[j], ':', true);
                if (value) {
                    keyframe[attr] = value;
                }
            }
            result[percent] = keyframe;
            valid = true;
        });
    }
    return valid ? result : null;
}

export function parseTransform(value: string, options?: TransformOptions) {
    let accumulate: Undef<boolean>,
        boundingBox: Optional<Dimension>;
    if (options) {
        ({ accumulate, boundingBox } = options);
    }
    const result: TransformData[] = [];
    const transforms = splitEnclosing(value);
    for (let i = 0, length = transforms.length; i < length; i += 2) {
        const method = transforms[i].trim();
        const transform = method + transforms[i + 1];
        if (startsWith(method, 'translate')) {
            const translate = TRANSFORM.TRANSLATE.exec(transform);
            if (translate) {
                const tX = translate[2];
                let x = 0,
                    y = 0,
                    z = 0,
                    group = 'translate',
                    n: number;
                switch (method) {
                    case 'translate':
                    case 'translate3d': {
                        if (!isNaN(n = asPercent(tX))) {
                            if (boundingBox) {
                                x = n * boundingBox.width;
                            }
                        }
                        else {
                            x = parseUnit(tX, options);
                        }
                        const tY = translate[3];
                        if (tY) {
                            if (!isNaN(n = asPercent(tY))) {
                                if (boundingBox) {
                                    y = n * boundingBox.height;
                                }
                            }
                            else {
                                y = parseUnit(tY, options);
                            }
                        }
                        if (method === 'translate3d') {
                            const tZ = translate[4];
                            if (tZ && !isPercent(tZ)) {
                                z = parseUnit(tZ, options);
                                group += '3d';
                            }
                            else {
                                continue;
                            }
                        }
                        break;
                    }
                    case 'translateX':
                        if (!isNaN(n = asPercent(tX))) {
                            if (boundingBox) {
                                x = n * boundingBox.width;
                            }
                        }
                        else {
                            x = parseUnit(tX, options);
                        }
                        break;
                    case 'translateY':
                        if (!isNaN(n = asPercent(tX))) {
                            if (boundingBox) {
                                y = n * boundingBox.height;
                            }
                        }
                        else {
                            y = parseUnit(tX, options);
                        }
                        break;
                    case 'translateZ':
                        z = parseUnit(tX, options);
                        break;
                }
                if (accumulate) {
                    const values = result.find(item => item.group === group)?.values;
                    if (values) {
                        values[0] += x;
                        values[1] += y;
                        values[2] += z;
                        continue;
                    }
                }
                result.push({ group, method, values: [x, y, z] });
            }
        }
        else if (startsWith(method, 'rotate')) {
            const rotate = TRANSFORM.ROTATE.exec(transform);
            if (rotate) {
                const angle = convertAngle(rotate[5], rotate[6]);
                if (!isNaN(angle)) {
                    let x = 0,
                        y = 0,
                        z = 0,
                        group = 'rotate';
                    switch (method) {
                        case 'rotate':
                            x = angle;
                            y = angle;
                            break;
                        case 'rotateX':
                            x = angle;
                            break;
                        case 'rotateY':
                            y = angle;
                            break;
                        case 'rotateZ':
                            z = angle;
                            break;
                        case 'rotate3d':
                            x = +rotate[2];
                            y = +rotate[3];
                            z = +rotate[4];
                            if (isNaN(x) || isNaN(y) || isNaN(z)) {
                                continue;
                            }
                            group += '3d';
                            break;
                    }
                    if (accumulate) {
                        const data = result.find(item => item.group === group);
                        if (data) {
                            const values = data.values;
                            values[0] += x;
                            values[1] += y;
                            values[2] += z;
                            if (data.angle !== undefined) {
                                data.angle += angle;
                            }
                            continue;
                        }
                    }
                    result.push({ group, method, values: [x, y, z], angle: method === 'rotate3d' ? angle : undefined });
                }
            }
        }
        else if (startsWith(method, 'scale')) {
            const scale = TRANSFORM.SCALE.exec(transform);
            if (scale) {
                let x = 1,
                    y = 1,
                    z = 1,
                    group = 'scale';
                switch (method) {
                    case 'scale':
                    case 'scale3d':
                        x = +scale[2];
                        y = scale[3] ? +scale[3] : x;
                        if (method === 'scale3d') {
                            if (scale[4]) {
                                z = +scale[4];
                                group += '3d';
                            }
                            else {
                                continue;
                            }
                        }
                        break;
                    case 'scaleX':
                        x = +scale[2];
                        break;
                    case 'scaleY':
                        y = +scale[2];
                        break;
                    case 'scaleZ':
                        z = +scale[2];
                        break;
                }
                if (accumulate) {
                    const values = result.find(item => item.group === group)?.values;
                    if (values) {
                        values[0] *= x;
                        values[1] *= y;
                        values[2] *= z;
                        continue;
                    }
                }
                result.push({ group, method, values: [x, y, z] });
            }
        }
        else if (startsWith(method, 'skew')) {
            const skew = TRANSFORM.SKEW.exec(transform);
            if (skew) {
                const angle = convertAngle(skew[2], skew[3]);
                if (!isNaN(angle)) {
                    let x = 0,
                        y = 0;
                    switch (method) {
                        case 'skew':
                            x = angle;
                            if (skew[4] && skew[5]) {
                                y = convertAngle(skew[4], skew[5], 0);
                            }
                            break;
                        case 'skewX':
                            x = angle;
                            break;
                        case 'skewY':
                            y = angle;
                            break;
                    }
                    if (accumulate) {
                        const values = result.find(item => item.group === 'skew')?.values;
                        if (values) {
                            values[0] += x;
                            values[1] += y;
                            continue;
                        }
                    }
                    result.push({ group: 'skew', method, values: [x, y] });
                }
            }
        }
        else if (startsWith(method, 'matrix')) {
            const matrix = TRANSFORM.MATRIX.exec(transform);
            if (matrix) {
                let args: number;
                if (method === 'matrix') {
                    if (matrix[8]) {
                        continue;
                    }
                    args = 6;
                }
                else {
                    if (!matrix[17]) {
                        continue;
                    }
                    args = 16;
                }
                const values = new Array(args);
                for (let j = 0; j < args; ++j) {
                    values[j] = +matrix[j + 2];
                }
                result.push({ group: method, method, values });
            }
        }
        else if (method === 'perspective') {
            const perspective = TRANSFORM.PERSPECTIVE.exec(transform);
            if (perspective) {
                const pX = perspective[2];
                const n = asPercent(pX);
                let x = 0;
                if (!isNaN(n)) {
                    if (boundingBox) {
                        x = n * boundingBox.width;
                    }
                }
                else {
                    x = parseUnit(pX, options);
                }
                if (accumulate) {
                    const values = result.find(item => item.group === 'perspective')?.values;
                    if (values) {
                        values[0] = x;
                        continue;
                    }
                }
                result.push({ group: 'perspective', method, values: [x] });
            }
        }
    }
    return result;
}