import { clamp } from './math';
import { CSS } from './regex';

class Color implements ColorData {
    public key: string;
    public rgba: RGBA;

    private _value: string;

    constructor(key?: string, value?: string, rgba?: RGBA) {
        if (value) {
            this._value = value;
            this.rgba = rgba || hex6(value);
        }
        else if (rgba) {
            this._value = convertHex(rgba, true);
            this.rgba = rgba;
        }
        else {
            key = 'transparent';
            this._value = '#000000';
            this.rgba = { r: 0, g: 0, b: 0, a: 0 };
        }
        Object.freeze(this.rgba);
        this.key = key || this.rgba.a === 255 && COLOR_HEX[this.value] || '';
    }

    set value(value: string) {
        const color = parseColor(value);
        if (color) {
            this.key = color.key;
            this._value = color.value;
            this.rgba = color.rgba;
        }
    }
    get value() {
        return this._value;
    }
    get hsla() {
        return convertHSLA(this.rgba);
    }
    get valueAsRGBA() {
        return this.value + getHex(Math.round(this.rgba.a));
    }
    get valueAsARGB() {
        return '#' + getHex(Math.round(this.rgba.a)) + this.value.substring(1);
    }
    get rgbaAsString() {
        return formatRGBA(this.rgba);
    }
    get hslaAsString() {
        return formatHSLA(this.hsla);
    }
    get opacity() {
        return this.rgba.a / 255;
    }
    get transparent() {
        return this.rgba.a === 0;
    }
    get nearest() {
        if (COLOR_HEX[this.value]) {
            return COLOR_CSS3.get(COLOR_HEX[this.value]!) as ColorData;
        }
        const hsl = this.hsla;
        const h = hsl.h;
        const result: ColorData[] = [];
        let baseline = -1;
        for (const color of (COLOR_CSS3 as Map<string, ColorData>).values()) {
            if (baseline !== -1) {
                if (baseline === color.hsla.h) {
                    result.push(color);
                }
            }
            else if (h <= color.hsla.h) {
                result.push(color);
                baseline = color.hsla.h;
            }
        }
        const length = result.length;
        if (length === 1) {
            return result[0];
        }
        else if (length > 1) {
            const total = hsl.l + hsl.s;
            let nearest = Infinity,
                index = -1;
            for (let i = 0; i < length; ++i) {
                const { l, s } = result[i].hsla;
                const offset = Math.abs(total - (l + s));
                if (offset < nearest) {
                    nearest = offset;
                    index = i;
                }
            }
            return result[index];
        }
        return COLOR_CSS3.get('lightpink') as ColorData;
    }
}

const COLOR_HEX: StringMap = {};
const COLOR_CSS3 = new Map<string, unknown>([
    ['black', '#000000'],
    ['dimgray', '#696969'],
    ['dimgrey', '#696969'],
    ['gray', '#808080'],
    ['grey', '#808080'],
    ['darkgray', '#a9a9a9'],
    ['darkgrey', '#a9a9a9'],
    ['silver', '#c0c0c0'],
    ['lightgray', '#d3d3d3'],
    ['lightgrey', '#d3d3d3'],
    ['gainsboro', '#dcdcdc'],
    ['whitesmoke', '#f5f5f5'],
    ['white', '#ffffff'],
    ['rosybrown', '#bc8f8f'],
    ['indianred', '#cd5c5c'],
    ['brown', '#a52a2a'],
    ['firebrick', '#b22222'],
    ['lightcoral', '#f08080'],
    ['maroon', '#800000'],
    ['darkred', '#8b0000'],
    ['red', '#ff0000'],
    ['snow', '#fffafa'],
    ['mistyrose', '#ffe4e1'],
    ['salmon', '#fa8072'],
    ['tomato', '#ff6347'],
    ['darksalmon', '#e9967a'],
    ['coral', '#ff7f50'],
    ['orangered', '#ff4500'],
    ['lightsalmon', '#ffa07a'],
    ['sienna', '#a0522d'],
    ['seashell', '#fff5ee'],
    ['chocolate', '#d2691e'],
    ['saddlebrown', '#8b4513'],
    ['sandybrown', '#f4a460'],
    ['peachpuff', '#ffdab9'],
    ['peru', '#cd853f'],
    ['linen', '#faf0e6'],
    ['bisque', '#ffe4c4'],
    ['darkorange', '#ff8c00'],
    ['burlywood', '#deb887'],
    ['antiquewhite', '#faebd7'],
    ['tan', '#d2b48c'],
    ['navajowhite', '#ffdead'],
    ['blanchedalmond', '#ffebcd'],
    ['papayawhip', '#ffefd5'],
    ['moccasin', '#ffe4b5'],
    ['orange', '#ffa500'],
    ['wheat', '#f5deb3'],
    ['oldlace', '#fdf5e6'],
    ['floralwhite', '#fffaf0'],
    ['darkgoldenrod', '#b8860b'],
    ['goldenrod', '#daa520'],
    ['cornsilk', '#fff8dc'],
    ['gold', '#ffd700'],
    ['lemonchiffon', '#fffacd'],
    ['khaki', '#f0e68c'],
    ['palegoldenrod', '#eee8aa'],
    ['darkkhaki', '#bdb76b'],
    ['beige', '#f5f5dc'],
    ['lightgoldenrodyellow', '#fafad2'],
    ['olive', '#808000'],
    ['yellow', '#ffff00'],
    ['lightyellow', '#ffffe0'],
    ['ivory', '#fffff0'],
    ['olivedrab', '#6b8e23'],
    ['yellowgreen', '#9acd32'],
    ['darkolivegreen', '#556b2f'],
    ['greenyellow', '#adff2f'],
    ['chartreuse', '#7fff00'],
    ['lawngreen', '#7cfc00'],
    ['darkseagreen', '#8fbc8f'],
    ['forestgreen', '#228b22'],
    ['limegreen', '#32cd32'],
    ['lightgreen', '#90ee90'],
    ['palegreen', '#98fb98'],
    ['darkgreen', '#006400'],
    ['green', '#008000'],
    ['lime', '#00ff00'],
    ['honeydew', '#f0fff0'],
    ['seagreen', '#2e8b57'],
    ['mediumseagreen', '#3cb371'],
    ['springgreen', '#00ff7f'],
    ['mintcream', '#f5fffa'],
    ['mediumspringgreen', '#00fa9a'],
    ['mediumaquamarine', '#66cdaa'],
    ['aquamarine', '#7fffd4'],
    ['turquoise', '#40e0d0'],
    ['lightseagreen', '#20b2aa'],
    ['mediumturquoise', '#48d1cc'],
    ['darkslategray', '#2f4f4f'],
    ['darkslategrey', '#2f4f4f'],
    ['paleturquoise', '#afeeee'],
    ['teal', '#008080'],
    ['darkcyan', '#008b8b'],
    ['aqua', '#00ffff'],
    ['cyan', '#00ffff'],
    ['lightcyan', '#e0ffff'],
    ['azure', '#f0ffff'],
    ['darkturquoise', '#00ced1'],
    ['cadetblue', '#5f9ea0'],
    ['powderblue', '#b0e0e6'],
    ['lightblue', '#add8e6'],
    ['deepskyblue', '#00bfff'],
    ['skyblue', '#87ceeb'],
    ['lightskyblue', '#87cefa'],
    ['steelblue', '#4682b4'],
    ['aliceblue', '#f0f8ff'],
    ['dodgerblue', '#1e90ff'],
    ['slategray', '#708090'],
    ['slategrey', '#708090'],
    ['lightslategray', '#778899'],
    ['lightslategrey', '#778899'],
    ['lightsteelblue', '#b0c4de'],
    ['cornflower', '#6495ed'],
    ['royalblue', '#4169e1'],
    ['midnightblue', '#191970'],
    ['lavender', '#e6e6fa'],
    ['navy', '#000080'],
    ['darkblue', '#00008b'],
    ['mediumblue', '#0000cd'],
    ['blue', '#0000ff'],
    ['ghostwhite', '#f8f8ff'],
    ['slateblue', '#6a5acd'],
    ['darkslateblue', '#483d8b'],
    ['mediumslateblue', '#7b68ee'],
    ['mediumpurple', '#9370db'],
    ['blueviolet', '#8a2be2'],
    ['indigo', '#4b0082'],
    ['darkorchid', '#9932cc'],
    ['darkviolet', '#9400d3'],
    ['mediumorchid', '#ba55d3'],
    ['thistle', '#d8bfd8'],
    ['plum', '#dda0dd'],
    ['violet', '#ee82ee'],
    ['purple', '#800080'],
    ['darkmagenta', '#8b008b'],
    ['fuchsia', '#ff00ff'],
    ['magenta', '#ff00ff'],
    ['orchid', '#da70d6'],
    ['mediumvioletred', '#c71585'],
    ['deeppink', '#ff1493'],
    ['hotpink', '#ff69b4'],
    ['lavenderblush', '#fff0f5'],
    ['palevioletred', '#db7093'],
    ['crimson', '#dc143c'],
    ['pink', '#ffc0cb'],
    ['lightpink', '#ffb6c1']
]);

for (const [key, value] of COLOR_CSS3.entries()) {
    COLOR_HEX[value as string] = key;
    COLOR_CSS3.set(key, Object.freeze(new Color(key, value as string)));
}

function hue2rgb(t: number, p: number, q: number) {
    if (t < 0) {
        t += 1;
    }
    else if (t > 1) {
        t -= 1;
    }
    if (t < 1/6) {
        return p + (q - p) * 6 * t;
    }
    else if (t < 1/2) {
        return q;
    }
    else if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
    }
    return p;
}

function hex6(value: string, a = 255) {
    return {
        r: parseInt(value[1] + value[2], 16),
        g: parseInt(value[3] + value[4], 16),
        b: parseInt(value[5] + value[6], 16),
        a
    } as RGBA;
}

const convertOpacity = (value: string) => parseFloat(value) / (value.includes('%') ? 100 : 1);
const clampOpacity = (value: number) => clamp(value) * 255;

export function parseColor(value: string, opacity = 1) {
    let key: Undef<string>,
        rgba: Null<RGBA>;
    if (value[0] === '#') {
        rgba = parseRGBA(value = value.toLowerCase());
        if (value.length !== 7) {
            value = '';
        }
    }
    else if (value === 'transparent') {
        return new Color();
    }
    else {
        const color = COLOR_CSS3.get(value) as Undef<ColorData>;
        if (color) {
            rgba = { ...color.rgba };
            value = color.value;
            if (opacity < 1) {
                rgba.a = clampOpacity(opacity);
            }
            else {
                key = color.key;
            }
        }
        else {
            let match = CSS.RGBA.exec(value);
            if (match) {
                rgba = {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: match[4] ? convertOpacity(match[4]) * 255 : clampOpacity(opacity)
                };
                value = '';
            }
            else {
                match = CSS.HSLA.exec(value);
                if (match) {
                    rgba = convertRGBA({
                        h: parseInt(match[1]),
                        s: parseInt(match[2]),
                        l: parseInt(match[3]),
                        a: clamp(match[4] ? convertOpacity(match[4]) : opacity)
                    });
                    value = '';
                }
                else {
                    return null;
                }
            }
        }
    }
    return rgba ? new Color(key, value, rgba) as ColorData : null;
}

export function parseRGBA(value: string) {
    if (CSS.HEX.test(value)) {
        if (value[0] !== '#') {
            value = '#' + value;
        }
        let a = 255;
        switch (value.length) {
            case 7:
                break;
            case 5:
                a = parseInt(value[4].repeat(2), 16);
            case 4:
                value = '#' + value[1].repeat(2) + value[2].repeat(2) + value[3].repeat(2);
                break;
            case 6:
            case 8:
                return null;
            default:
                a = parseInt(value[7] + value[8], 16);
                value = value.substring(0, 7);
                break;
        }
        return hex6(value, a);
    }
    return null;
}

export function getHex(value: number) {
    const result = clamp(value, 0, 255).toString(16);
    return result.length === 1 ? '0' + result : result;
}

export function convertHex(value: RGBA, ignoreAlpha?: boolean) {
    return '#' + getHex(value.r) + getHex(value.g) + getHex(value.b) + (!ignoreAlpha && value.a < 255 ? getHex(value.a) : '');
}

export function convertHSLA(value: RGBA): HSLA {
    const r = value.r / 255;
    const g = value.g / 255;
    const b = value.b / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    let h = (max + min) / 2;
    const l = h;
    let s: number;
    if (max === min) {
        h = 0;
        s = 0;
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
        a: value.a / 255
    };
}

export function convertRGBA(value: HSLA): RGBA {
    let { h, s, l, a } = value;
    h /= 360;
    s /= 100;
    l /= 100;
    let r,
        g,
        b;
    if (s === 0) {
        r = l;
        g = l;
        b = l;
    }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(h + 1/3, p, q);
        g = hue2rgb(h, p, q);
        b = hue2rgb(h - 1/3, p, q);
    }
    r = Math.round(Math.min(r, 1) * 255);
    g = Math.round(Math.min(g, 1) * 255);
    b = Math.round(Math.min(b, 1) * 255);
    a = Math.round(Math.min(a, 1) * 255);
    return { r, g, b, a };
}

export function formatRGBA(value: RGBA) {
    return `rgb${value.a < 255 ? 'a' : ''}(${value.r}, ${value.g}, ${value.b + (value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : '')})`;
}

export function formatHSLA(value: HSLA) {
    return `hsl${value.a < 255 ? 'a' : ''}(${value.h}, ${value.s}%, ${value.l}%${value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : ''})`;
}