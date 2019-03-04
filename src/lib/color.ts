const HEX_CHAR = '0123456789ABCDEF';
const X11_CSS3 = {
    'Pink':                 { value: '#FFC0CB' },
    'LightPink':            { value: '#FFB6C1' },
    'HotPink':              { value: '#FF69B4' },
    'DeepPink':             { value: '#FF1493' },
    'PaleVioletRed':        { value: '#DB7093' },
    'MediumVioletRed':      { value: '#C71585' },
    'LightSalmon':          { value: '#FFA07A' },
    'Salmon':               { value: '#FA8072' },
    'DarkSalmon':           { value: '#E9967A' },
    'LightCoral':           { value: '#F08080' },
    'IndianRed':            { value: '#CD5C5C' },
    'Crimson':              { value: '#DC143C' },
    'Firebrick':            { value: '#B22222' },
    'DarkRed':              { value: '#8B0000' },
    'Red':                  { value: '#FF0000' },
    'OrangeRed':            { value: '#FF4500' },
    'Tomato':               { value: '#FF6347' },
    'Coral':                { value: '#FF7F50' },
    'Orange':               { value: '#FFA500' },
    'DarkOrange':           { value: '#FF8C00' },
    'Yellow':               { value: '#FFFF00' },
    'LightYellow':          { value: '#FFFFE0' },
    'LemonChiffon':         { value: '#FFFACD' },
    'LightGoldenrodYellow': { value: '#FAFAD2' },
    'PapayaWhip':           { value: '#FFEFD5' },
    'Moccasin':             { value: '#FFE4B5' },
    'PeachPuff':            { value: '#FFDAB9' },
    'PaleGoldenrod':        { value: '#EEE8AA' },
    'Khaki':                { value: '#F0E68C' },
    'DarkKhaki':            { value: '#BDB76B' },
    'Gold':                 { value: '#FFD700' },
    'Cornsilk':             { value: '#FFF8DC' },
    'BlanchedAlmond':       { value: '#FFEBCD' },
    'Bisque':               { value: '#FFE4C4' },
    'NavajoWhite':          { value: '#FFDEAD' },
    'Wheat':                { value: '#F5DEB3' },
    'Burlywood':            { value: '#DEB887' },
    'Tan':                  { value: '#D2B48C' },
    'RosyBrown':            { value: '#BC8F8F' },
    'SandyBrown':           { value: '#F4A460' },
    'Goldenrod':            { value: '#DAA520' },
    'DarkGoldenrod':        { value: '#B8860B' },
    'Peru':                 { value: '#CD853F' },
    'Chocolate':            { value: '#D2691E' },
    'SaddleBrown':          { value: '#8B4513' },
    'Sienna':               { value: '#A0522D' },
    'Brown':                { value: '#A52A2A' },
    'Maroon':               { value: '#800000' },
    'DarkOliveGreen':       { value: '#556B2F' },
    'Olive':                { value: '#808000' },
    'OliveDrab':            { value: '#6B8E23' },
    'YellowGreen':          { value: '#9ACD32' },
    'LimeGreen':            { value: '#32CD32' },
    'Lime':                 { value: '#00FF00' },
    'LawnGreen':            { value: '#7CFC00' },
    'Chartreuse':           { value: '#7FFF00' },
    'GreenYellow':          { value: '#ADFF2F' },
    'SpringGreen':          { value: '#00FF7F' },
    'MediumSpringGreen':    { value: '#00FA9A' },
    'LightGreen':           { value: '#90EE90' },
    'PaleGreen':            { value: '#98FB98' },
    'DarkSeaGreen':         { value: '#8FBC8F' },
    'MediumAquamarine':     { value: '#66CDAA' },
    'MediumSeaGreen':       { value: '#3CB371' },
    'SeaGreen':             { value: '#2E8B57' },
    'ForestGreen':          { value: '#228B22' },
    'Green':                { value: '#008000' },
    'DarkGreen':            { value: '#006400' },
    'Aqua':                 { value: '#00FFFF' },
    'Cyan':                 { value: '#00FFFF' },
    'LightCyan':            { value: '#E0FFFF' },
    'PaleTurquoise':        { value: '#AFEEEE' },
    'Aquamarine':           { value: '#7FFFD4' },
    'Turquoise':            { value: '#40E0D0' },
    'DarkTurquoise':        { value: '#00CED1' },
    'MediumTurquoise':      { value: '#48D1CC' },
    'LightSeaGreen':        { value: '#20B2AA' },
    'CadetBlue':            { value: '#5F9EA0' },
    'DarkCyan':             { value: '#008B8B' },
    'Teal':                 { value: '#008080' },
    'LightSteelBlue':       { value: '#B0C4DE' },
    'PowderBlue':           { value: '#B0E0E6' },
    'LightBlue':            { value: '#ADD8E6' },
    'SkyBlue':              { value: '#87CEEB' },
    'LightSkyBlue':         { value: '#87CEFA' },
    'DeepSkyBlue':          { value: '#00BFFF' },
    'DodgerBlue':           { value: '#1E90FF' },
    'Cornflower':           { value: '#6495ED' },
    'SteelBlue':            { value: '#4682B4' },
    'RoyalBlue':            { value: '#4169E1' },
    'Blue':                 { value: '#0000FF' },
    'MediumBlue':           { value: '#0000CD' },
    'DarkBlue':             { value: '#00008B' },
    'Navy':                 { value: '#000080' },
    'MidnightBlue':         { value: '#191970' },
    'Lavender':             { value: '#E6E6FA' },
    'Thistle':              { value: '#D8BFD8' },
    'Plum':                 { value: '#DDA0DD' },
    'Violet':               { value: '#EE82EE' },
    'Orchid':               { value: '#DA70D6' },
    'Fuchsia':              { value: '#FF00FF' },
    'Magenta':              { value: '#FF00FF' },
    'MediumOrchid':         { value: '#BA55D3' },
    'MediumPurple':         { value: '#9370DB' },
    'BlueViolet':           { value: '#8A2BE2' },
    'DarkViolet':           { value: '#9400D3' },
    'DarkOrchid':           { value: '#9932CC' },
    'DarkMagenta':          { value: '#8B008B' },
    'Purple':               { value: '#800080' },
    'RebeccaPurple':        { value: '#663399' },
    'Indigo':               { value: '#4B0082' },
    'DarkSlateBlue':        { value: '#483D8B' },
    'SlateBlue':            { value: '#6A5ACD' },
    'MediumSlateBlue':      { value: '#7B68EE' },
    'White':                { value: '#FFFFFF' },
    'Snow':                 { value: '#FFFAFA' },
    'Honeydew':             { value: '#F0FFF0' },
    'MintCream':            { value: '#F5FFFA' },
    'Azure':                { value: '#F0FFFF' },
    'AliceBlue':            { value: '#F0F8FF' },
    'GhostWhite':           { value: '#F8F8FF' },
    'WhiteSmoke':           { value: '#F5F5F5' },
    'Seashell':             { value: '#FFF5EE' },
    'Beige':                { value: '#F5F5DC' },
    'OldLace':              { value: '#FDF5E6' },
    'FloralWhite':          { value: '#FFFAF0' },
    'Ivory':                { value: '#FFFFF0' },
    'AntiqueWhite':         { value: '#FAEBD7' },
    'Linen':                { value: '#FAF0E6' },
    'LavenderBlush':        { value: '#FFF0F5' },
    'MistyRose':            { value: '#FFE4E1' },
    'Gainsboro':            { value: '#DCDCDC' },
    'LightGray':            { value: '#D3D3D3' },
    'Silver':               { value: '#C0C0C0' },
    'DarkGray':             { value: '#A9A9A9' },
    'Gray':                 { value: '#808080' },
    'DimGray':              { value: '#696969' },
    'LightSlateGray':       { value: '#778899' },
    'SlateGray':            { value: '#708090' },
    'DarkSlateGray':        { value: '#2F4F4F' },
    'LightGrey':            { value: '#D3D3D3' },
    'DarkGrey':             { value: '#A9A9A9' },
    'Grey':                 { value: '#808080' },
    'DimGrey':              { value: '#696969' },
    'LightSlateGrey':       { value: '#778899' },
    'SlateGrey':            { value: '#708090' },
    'DarkSlateGrey':        { value: '#2F4F4F' },
    'Black':                { value: '#000000' }
};

const REGEXP_HEX = /[A-Za-z\d]{3,}/;
const REGEXP_RGBA = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/;

const HSL_SORTED: ColorResult[] = [];

for (const name in X11_CSS3) {
    const x11: ColorResult = X11_CSS3[name];
    x11.name = name;
    const rgba = convertRGBA(x11.value);
    if (rgba) {
        x11.rgba = rgba;
        x11.hsl = convertHSL(x11.rgba);
        HSL_SORTED.push(x11);
    }
}

HSL_SORTED.sort(sortHSL);

function convertHSL({ r = 0, g = 0, b = 0 }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    let h = (max + min) / 2;
    let s = h;
    const l = h;
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
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

function sortHSL(a: ColorResult, b: ColorResult) {
    if (a.hsl && b.hsl) {
        let c = a.hsl.h;
        let d = b.hsl.h;
        if (c === d) {
            c = a.hsl.s;
            d = b.hsl.s;
            if (c === d) {
                c = a.hsl.l;
                d = b.hsl.l;
            }
        }
        return c >= d ? 1 : -1;
    }
    return 0;
}

function convertAlpha(value: number) {
    return value < 1 ? convertHex(255 * value) : 'FF';
}

function parseOpacity(value: string) {
    const opacity = parseFloat(value.trim() || '1');
    return opacity < 1 ? opacity : 1;
}

export function findColorName(value: string) {
    for (const color in X11_CSS3) {
        if (color.toLowerCase() === value.trim().toLowerCase()) {
            return <ColorResult> X11_CSS3[color];
        }
    }
    return undefined;
}

export function findColorShade(value: string) {
    let index = HSL_SORTED.findIndex(item => item.value === value);
    if (index !== -1) {
        return HSL_SORTED[index];
    }
    else {
        const rgb = convertRGBA(value);
        if (rgb) {
            const hsl = convertHSL(rgb);
            if (hsl) {
                const result = HSL_SORTED.slice(0);
                result.push({
                    name: '',
                    value: '',
                    hsl,
                    rgba: { r: -1, g: -1, b: -1, a: 1 },
                });
                result.sort(sortHSL);
                index = result.findIndex(item => item.name === '');
                return result[Math.min(index + 1, result.length - 1)];
            }
        }
        return undefined;
    }
}

export function parseColor(value: string, opacity = '1', transparency = false) {
    if (value && (value !== 'transparent' || transparency)) {
        let rgba: RGBA | undefined;
        if (value.charAt(0) === '#') {
            rgba = convertRGBA(value);
        }
        else if (value === 'initial') {
            rgba = { r: 0, g: 0, b: 0, a: 1 };
        }
        else if (value === 'transparent') {
            rgba = { r: 0, g: 0, b: 0, a: 0 };
        }
        else if (value.startsWith('rgb')) {
            const match = value.match(REGEXP_RGBA);
            if (match) {
                rgba = {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: match[4] ? parseFloat(match[4]) : parseOpacity(opacity)
                };
            }
        }
        else {
            const color = findColorName(value);
            if (color) {
                rgba = <RGBA> color.rgba;
                rgba.a = parseOpacity(opacity);
            }
        }
        if (rgba && (rgba.a > 0 || transparency)) {
            const valueHex = convertHex(rgba.r) + convertHex(rgba.g) + convertHex(rgba.b);
            const valueAlpha = convertAlpha(rgba.a);
            const alpha = rgba.a;
            return <ColorData> {
                valueAsRGB: `#${valueHex}`,
                valueAsRGBA: `#${valueHex + valueAlpha}`,
                valueAsARGB: `#${valueAlpha + valueHex}`,
                alpha,
                rgba,
                opaque: alpha < 1,
                visible: alpha > 0
            };
        }
    }
    return undefined;
}

export function reduceColor(value: string, percent: number) {
    const rgba = convertRGBA(value);
    if (rgba) {
        const base = percent < 0 ? 0 : 255;
        percent = Math.abs(percent);
        rgba.r = Math.round((base - rgba.r) * percent) + rgba.r;
        rgba.g = Math.round((base - rgba.g) * percent) + rgba.g;
        rgba.b = Math.round((base - rgba.b) * percent) + rgba.b;
        return parseColor(formatRGBA(rgba));
    }
    return undefined;
}

export function convertHex(...values: string[] | number[]) {
    let output = '';
    for (const value of values) {
        let rgb = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(rgb)) {
            output += '00';
        }
        else {
            rgb = Math.max(0, Math.min(rgb, 255));
            output += HEX_CHAR.charAt((rgb - (rgb % 16)) / 16) + HEX_CHAR.charAt(rgb % 16);
        }
    }
    return output;
}

export function convertRGBA(value: string) {
    value = value.replace(/#/g, '').trim();
    if (REGEXP_HEX.test(value)) {
        let a = 255;
        switch (value.length) {
            case 4:
                a = parseInt(value.charAt(3).repeat(2), 16);
            case 3:
                value = value.charAt(0).repeat(2) + value.charAt(1).repeat(2) + value.charAt(2).repeat(2);
                break;
            case 5:
                value += value.charAt(4);
                break;
            default:
                if (value.length >= 8) {
                    a = parseInt(value.substring(6, 8), 16);
                }
                value = value.substring(0, 6);
                break;
        }
        if (value.length === 6) {
            return <RGBA> {
                r: parseInt(value.substring(0, 2), 16),
                g: parseInt(value.substring(2, 4), 16),
                b: parseInt(value.substring(4), 16),
                a
            };
        }
    }
    return undefined;
}

export function formatRGBA(rgba: RGBA) {
    return `rgb${rgba.a < 255 ? 'a' : ''}(${rgba.r}, ${rgba.g}, ${rgba.b}${rgba.a < 255 ? `, ${(rgba.a / 255).toPrecision(2)}` : ''})`;
}