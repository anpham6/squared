const { splitPair, splitSome } = squared.lib.util;

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
    const pattern = /((?:[\d.]+%\s*,?\s*)+|from|to)\s*{([^}]+)}/;
    let valid: Undef<boolean>;
    for (let i = 0, length = rules.length; i < length; ++i) {
        const item = rules[i] as CSSKeyframeRule;
        const match = pattern.exec(item.cssText);
        if (match) {
            const items = match[2].trim().split(/\s*;\s*/);
            const q = items.length;
            splitSome(item.keyText || match[1], percent => {
                switch (percent) {
                    case 'from':
                        percent = '0%';
                        break;
                    case 'to':
                        percent = '100%';
                        break;
                }
                const keyframe: StringMap = {};
                for (let j = 0; j < q; ++j) {
                    const [attr, value] = splitPair(items[j], ':', true);
                    if (value) {
                        keyframe[attr] = value;
                    }
                }
                result[percent] = keyframe;
                valid = true;
            });
        }
    }
    return valid ? result : null;
}