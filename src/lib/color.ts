import { clamp } from './math';
import { CSS } from './regex';

const STRING_HEX = '0123456789ABCDEF';
const COLOR_CSS3: ColorResult[] = [
    {
        value: '#000000',
        key: 'black',
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 }
    },
    {
        value: '#696969',
        key: 'dimgray',
        rgb: { r: 105, g: 105, b: 105 },
        hsl: { h: 0, s: 0, l: 41 }
    },
    {
        value: '#696969',
        key: 'dimgrey',
        rgb: { r: 105, g: 105, b: 105 },
        hsl: { h: 0, s: 0, l: 41 }
    },
    {
        value: '#808080',
        key: 'gray',
        rgb: { r: 128, g: 128, b: 128 },
        hsl: { h: 0, s: 0, l: 50 }
    },
    {
        value: '#808080',
        key: 'grey',
        rgb: { r: 128, g: 128, b: 128 },
        hsl: { h: 0, s: 0, l: 50 }
    },
    {
        value: '#A9A9A9',
        key: 'darkgray',
        rgb: { r: 169, g: 169, b: 169 },
        hsl: { h: 0, s: 0, l: 66 }
    },
    {
        value: '#A9A9A9',
        key: 'darkgrey',
        rgb: { r: 169, g: 169, b: 169 },
        hsl: { h: 0, s: 0, l: 66 }
    },
    {
        value: '#C0C0C0',
        key: 'silver',
        rgb: { r: 192, g: 192, b: 192 },
        hsl: { h: 0, s: 0, l: 75 }
    },
    {
        value: '#D3D3D3',
        key: 'lightgray',
        rgb: { r: 211, g: 211, b: 211 },
        hsl: { h: 0, s: 0, l: 83 }
    },
    {
        value: '#D3D3D3',
        key: 'lightgrey',
        rgb: { r: 211, g: 211, b: 211 },
        hsl: { h: 0, s: 0, l: 83 }
    },
    {
        value: '#DCDCDC',
        key: 'gainsboro',
        rgb: { r: 220, g: 220, b: 220 },
        hsl: { h: 0, s: 0, l: 86 }
    },
    {
        value: '#F5F5F5',
        key: 'whitesmoke',
        rgb: { r: 245, g: 245, b: 245 },
        hsl: { h: 0, s: 0, l: 96 }
    },
    {
        value: '#FFFFFF',
        key: 'white',
        rgb: { r: 255, g: 255, b: 255 },
        hsl: { h: 0, s: 0, l: 100 }
    },
    {
        value: '#BC8F8F',
        key: 'rosybrown',
        rgb: { r: 188, g: 143, b: 143 },
        hsl: { h: 0, s: 25, l: 65 }
    },
    {
        value: '#CD5C5C',
        key: 'indianred',
        rgb: { r: 205, g: 92, b: 92 },
        hsl: { h: 0, s: 53, l: 58 }
    },
    {
        value: '#A52A2A',
        key: 'brown',
        rgb: { r: 165, g: 42, b: 42 },
        hsl: { h: 0, s: 59, l: 41 }
    },
    {
        value: '#B22222',
        key: 'firebrick',
        rgb: { r: 178, g: 34, b: 34 },
        hsl: { h: 0, s: 68, l: 42 }
    },
    {
        value: '#F08080',
        key: 'lightcoral',
        rgb: { r: 240, g: 128, b: 128 },
        hsl: { h: 0, s: 79, l: 72 }
    },
    {
        value: '#800000',
        key: 'maroon',
        rgb: { r: 128, g: 0, b: 0 },
        hsl: { h: 0, s: 100, l: 25 }
    },
    {
        value: '#8B0000',
        key: 'darkred',
        rgb: { r: 139, g: 0, b: 0 },
        hsl: { h: 0, s: 100, l: 27 }
    },
    {
        value: '#FF0000',
        key: 'red',
        rgb: { r: 255, g: 0, b: 0 },
        hsl: { h: 0, s: 100, l: 50 }
    },
    {
        value: '#FFFAFA',
        key: 'snow',
        rgb: { r: 255, g: 250, b: 250 },
        hsl: { h: 0, s: 100, l: 99 }
    },
    {
        value: '#FFE4E1',
        key: 'mistyrose',
        rgb: { r: 255, g: 228, b: 225 },
        hsl: { h: 6, s: 100, l: 94 }
    },
    {
        value: '#FA8072',
        key: 'salmon',
        rgb: { r: 250, g: 128, b: 114 },
        hsl: { h: 6, s: 93, l: 71 }
    },
    {
        value: '#FF6347',
        key: 'tomato',
        rgb: { r: 255, g: 99, b: 71 },
        hsl: { h: 9, s: 100, l: 64 }
    },
    {
        value: '#E9967A',
        key: 'darksalmon',
        rgb: { r: 233, g: 150, b: 122 },
        hsl: { h: 15, s: 72, l: 70 }
    },
    {
        value: '#FF7F50',
        key: 'coral',
        rgb: { r: 255, g: 127, b: 80 },
        hsl: { h: 16, s: 100, l: 66 }
    },
    {
        value: '#FF4500',
        key: 'orangered',
        rgb: { r: 255, g: 69, b: 0 },
        hsl: { h: 16, s: 100, l: 50 }
    },
    {
        value: '#FFA07A',
        key: 'lightsalmon',
        rgb: { r: 255, g: 160, b: 122 },
        hsl: { h: 17, s: 100, l: 74 }
    },
    {
        value: '#A0522D',
        key: 'sienna',
        rgb: { r: 160, g: 82, b: 45 },
        hsl: { h: 19, s: 56, l: 40 }
    },
    {
        value: '#FFF5EE',
        key: 'seashell',
        rgb: { r: 255, g: 245, b: 238 },
        hsl: { h: 25, s: 100, l: 97 }
    },
    {
        value: '#D2691E',
        key: 'chocolate',
        rgb: { r: 210, g: 105, b: 30 },
        hsl: { h: 25, s: 75, l: 47 }
    },
    {
        value: '#8B4513',
        key: 'saddlebrown',
        rgb: { r: 139, g: 69, b: 19 },
        hsl: { h: 25, s: 76, l: 31 }
    },
    {
        value: '#F4A460',
        key: 'sandybrown',
        rgb: { r: 244, g: 164, b: 96 },
        hsl: { h: 28, s: 87, l: 67 }
    },
    {
        value: '#FFDAB9',
        key: 'peachpuff',
        rgb: { r: 255, g: 218, b: 185 },
        hsl: { h: 28, s: 100, l: 86 }
    },
    {
        value: '#CD853F',
        key: 'peru',
        rgb: { r: 205, g: 133, b: 63 },
        hsl: { h: 30, s: 59, l: 53 }
    },
    {
        value: '#FAF0E6',
        key: 'linen',
        rgb: { r: 250, g: 240, b: 230 },
        hsl: { h: 30, s: 67, l: 94 }
    },
    {
        value: '#FFE4C4',
        key: 'bisque',
        rgb: { r: 255, g: 228, b: 196 },
        hsl: { h: 33, s: 100, l: 88 }
    },
    {
        value: '#FF8C00',
        key: 'darkorange',
        rgb: { r: 255, g: 140, b: 0 },
        hsl: { h: 33, s: 100, l: 50 }
    },
    {
        value: '#DEB887',
        key: 'burlywood',
        rgb: { r: 222, g: 184, b: 135 },
        hsl: { h: 34, s: 57, l: 70 }
    },
    {
        value: '#FAEBD7',
        key: 'antiquewhite',
        rgb: { r: 250, g: 235, b: 215 },
        hsl: { h: 34, s: 78, l: 91 }
    },
    {
        value: '#D2B48C',
        key: 'tan',
        rgb: { r: 210, g: 180, b: 140 },
        hsl: { h: 34, s: 44, l: 69 }
    },
    {
        value: '#FFDEAD',
        key: 'navajowhite',
        rgb: { r: 255, g: 222, b: 173 },
        hsl: { h: 36, s: 100, l: 84 }
    },
    {
        value: '#FFEBCD',
        key: 'blanchedalmond',
        rgb: { r: 255, g: 235, b: 205 },
        hsl: { h: 36, s: 100, l: 90 }
    },
    {
        value: '#FFEFD5',
        key: 'papayawhip',
        rgb: { r: 255, g: 239, b: 213 },
        hsl: { h: 37, s: 100, l: 92 }
    },
    {
        value: '#FFE4B5',
        key: 'moccasin',
        rgb: { r: 255, g: 228, b: 181 },
        hsl: { h: 38, s: 100, l: 85 }
    },
    {
        value: '#FFA500',
        key: 'orange',
        rgb: { r: 255, g: 165, b: 0 },
        hsl: { h: 39, s: 100, l: 50 }
    },
    {
        value: '#F5DEB3',
        key: 'wheat',
        rgb: { r: 245, g: 222, b: 179 },
        hsl: { h: 39, s: 77, l: 83 }
    },
    {
        value: '#FDF5E6',
        key: 'oldlace',
        rgb: { r: 253, g: 245, b: 230 },
        hsl: { h: 39, s: 85, l: 95 }
    },
    {
        value: '#FFFAF0',
        key: 'floralwhite',
        rgb: { r: 255, g: 250, b: 240 },
        hsl: { h: 40, s: 100, l: 97 }
    },
    {
        value: '#B8860B',
        key: 'darkgoldenrod',
        rgb: { r: 184, g: 134, b: 11 },
        hsl: { h: 43, s: 89, l: 38 }
    },
    {
        value: '#DAA520',
        key: 'goldenrod',
        rgb: { r: 218, g: 165, b: 32 },
        hsl: { h: 43, s: 74, l: 49 }
    },
    {
        value: '#FFF8DC',
        key: 'cornsilk',
        rgb: { r: 255, g: 248, b: 220 },
        hsl: { h: 48, s: 100, l: 93 }
    },
    {
        value: '#FFD700',
        key: 'gold',
        rgb: { r: 255, g: 215, b: 0 },
        hsl: { h: 51, s: 100, l: 50 }
    },
    {
        value: '#FFFACD',
        key: 'lemonchiffon',
        rgb: { r: 255, g: 250, b: 205 },
        hsl: { h: 54, s: 100, l: 90 }
    },
    {
        value: '#F0E68C',
        key: 'khaki',
        rgb: { r: 240, g: 230, b: 140 },
        hsl: { h: 54, s: 77, l: 75 }
    },
    {
        value: '#EEE8AA',
        key: 'palegoldenrod',
        rgb: { r: 238, g: 232, b: 170 },
        hsl: { h: 55, s: 67, l: 80 }
    },
    {
        value: '#BDB76B',
        key: 'darkkhaki',
        rgb: { r: 189, g: 183, b: 107 },
        hsl: { h: 56, s: 38, l: 58 }
    },
    {
        value: '#F5F5DC',
        key: 'beige',
        rgb: { r: 245, g: 245, b: 220 },
        hsl: { h: 60, s: 56, l: 91 }
    },
    {
        value: '#FAFAD2',
        key: 'lightgoldenrodyellow',
        rgb: { r: 250, g: 250, b: 210 },
        hsl: { h: 60, s: 80, l: 90 }
    },
    {
        value: '#808000',
        key: 'olive',
        rgb: { r: 128, g: 128, b: 0 },
        hsl: { h: 60, s: 100, l: 25 }
    },
    {
        value: '#FFFF00',
        key: 'yellow',
        rgb: { r: 255, g: 255, b: 0 },
        hsl: { h: 60, s: 100, l: 50 }
    },
    {
        value: '#FFFFE0',
        key: 'lightyellow',
        rgb: { r: 255, g: 255, b: 224 },
        hsl: { h: 60, s: 100, l: 94 }
    },
    {
        value: '#FFFFF0',
        key: 'ivory',
        rgb: { r: 255, g: 255, b: 240 },
        hsl: { h: 60, s: 100, l: 97 }
    },
    {
        value: '#6B8E23',
        key: 'olivedrab',
        rgb: { r: 107, g: 142, b: 35 },
        hsl: { h: 80, s: 60, l: 35 }
    },
    {
        value: '#9ACD32',
        key: 'yellowgreen',
        rgb: { r: 154, g: 205, b: 50 },
        hsl: { h: 80, s: 61, l: 50 }
    },
    {
        value: '#556B2F',
        key: 'darkolivegreen',
        rgb: { r: 85, g: 107, b: 47 },
        hsl: { h: 82, s: 39, l: 30 }
    },
    {
        value: '#ADFF2F',
        key: 'greenyellow',
        rgb: { r: 173, g: 255, b: 47 },
        hsl: { h: 84, s: 100, l: 59 }
    },
    {
        value: '#7FFF00',
        key: 'chartreuse',
        rgb: { r: 127, g: 255, b: 0 },
        hsl: { h: 90, s: 100, l: 50 }
    },
    {
        value: '#7CFC00',
        key: 'lawngreen',
        rgb: { r: 124, g: 252, b: 0 },
        hsl: { h: 90, s: 100, l: 49 }
    },
    {
        value: '#8FBC8F',
        key: 'darkseagreen',
        rgb: { r: 143, g: 188, b: 143 },
        hsl: { h: 120, s: 25, l: 65 }
    },
    {
        value: '#228B22',
        key: 'forestgreen',
        rgb: { r: 34, g: 139, b: 34 },
        hsl: { h: 120, s: 61, l: 34 }
    },
    {
        value: '#32CD32',
        key: 'limegreen',
        rgb: { r: 50, g: 205, b: 50 },
        hsl: { h: 120, s: 61, l: 50 }
    },
    {
        value: '#90EE90',
        key: 'lightgreen',
        rgb: { r: 144, g: 238, b: 144 },
        hsl: { h: 120, s: 73, l: 75 }
    },
    {
        value: '#98FB98',
        key: 'palegreen',
        rgb: { r: 152, g: 251, b: 152 },
        hsl: { h: 120, s: 93, l: 79 }
    },
    {
        value: '#006400',
        key: 'darkgreen',
        rgb: { r: 0, g: 100, b: 0 },
        hsl: { h: 120, s: 100, l: 20 }
    },
    {
        value: '#008000',
        key: 'green',
        rgb: { r: 0, g: 128, b: 0 },
        hsl: { h: 120, s: 100, l: 25 }
    },
    {
        value: '#00FF00',
        key: 'lime',
        rgb: { r: 0, g: 255, b: 0 },
        hsl: { h: 120, s: 100, l: 50 }
    },
    {
        value: '#F0FFF0',
        key: 'honeydew',
        rgb: { r: 240, g: 255, b: 240 },
        hsl: { h: 120, s: 100, l: 97 }
    },
    {
        value: '#2E8B57',
        key: 'seagreen',
        rgb: { r: 46, g: 139, b: 87 },
        hsl: { h: 146, s: 50, l: 36 }
    },
    {
        value: '#3CB371',
        key: 'mediumseagreen',
        rgb: { r: 60, g: 179, b: 113 },
        hsl: { h: 147, s: 50, l: 47 }
    },
    {
        value: '#00FF7F',
        key: 'springgreen',
        rgb: { r: 0, g: 255, b: 127 },
        hsl: { h: 150, s: 100, l: 50 }
    },
    {
        value: '#F5FFFA',
        key: 'mintcream',
        rgb: { r: 245, g: 255, b: 250 },
        hsl: { h: 150, s: 100, l: 98 }
    },
    {
        value: '#00FA9A',
        key: 'mediumspringgreen',
        rgb: { r: 0, g: 250, b: 154 },
        hsl: { h: 157, s: 100, l: 49 }
    },
    {
        value: '#66CDAA',
        key: 'mediumaquamarine',
        rgb: { r: 102, g: 205, b: 170 },
        hsl: { h: 160, s: 51, l: 60 }
    },
    {
        value: '#7FFFD4',
        key: 'aquamarine',
        rgb: { r: 127, g: 255, b: 212 },
        hsl: { h: 160, s: 100, l: 75 }
    },
    {
        value: '#40E0D0',
        key: 'turquoise',
        rgb: { r: 64, g: 224, b: 208 },
        hsl: { h: 174, s: 72, l: 56 }
    },
    {
        value: '#20B2AA',
        key: 'lightseagreen',
        rgb: { r: 32, g: 178, b: 170 },
        hsl: { h: 177, s: 70, l: 41 }
    },
    {
        value: '#48D1CC',
        key: 'mediumturquoise',
        rgb: { r: 72, g: 209, b: 204 },
        hsl: { h: 178, s: 60, l: 55 }
    },
    {
        value: '#2F4F4F',
        key: 'darkslategray',
        rgb: { r: 47, g: 79, b: 79 },
        hsl: { h: 180, s: 25, l: 25 }
    },
    {
        value: '#2F4F4F',
        key: 'darkslategrey',
        rgb: { r: 47, g: 79, b: 79 },
        hsl: { h: 180, s: 25, l: 25 }
    },
    {
        value: '#AFEEEE',
        key: 'paleturquoise',
        rgb: { r: 175, g: 238, b: 238 },
        hsl: { h: 180, s: 65, l: 81 }
    },
    {
        value: '#008080',
        key: 'teal',
        rgb: { r: 0, g: 128, b: 128 },
        hsl: { h: 180, s: 100, l: 25 }
    },
    {
        value: '#008B8B',
        key: 'darkcyan',
        rgb: { r: 0, g: 139, b: 139 },
        hsl: { h: 180, s: 100, l: 27 }
    },
    {
        value: '#00FFFF',
        key: 'aqua',
        rgb: { r: 0, g: 255, b: 255 },
        hsl: { h: 180, s: 100, l: 50 }
    },
    {
        value: '#00FFFF',
        key: 'cyan',
        rgb: { r: 0, g: 255, b: 255 },
        hsl: { h: 180, s: 100, l: 50 }
    },
    {
        value: '#E0FFFF',
        key: 'lightcyan',
        rgb: { r: 224, g: 255, b: 255 },
        hsl: { h: 180, s: 100, l: 94 }
    },
    {
        value: '#F0FFFF',
        key: 'azure',
        rgb: { r: 240, g: 255, b: 255 },
        hsl: { h: 180, s: 100, l: 97 }
    },
    {
        value: '#00CED1',
        key: 'darkturquoise',
        rgb: { r: 0, g: 206, b: 209 },
        hsl: { h: 181, s: 100, l: 41 }
    },
    {
        value: '#5F9EA0',
        key: 'cadetblue',
        rgb: { r: 95, g: 158, b: 160 },
        hsl: { h: 182, s: 25, l: 50 }
    },
    {
        value: '#B0E0E6',
        key: 'powderblue',
        rgb: { r: 176, g: 224, b: 230 },
        hsl: { h: 187, s: 52, l: 80 }
    },
    {
        value: '#ADD8E6',
        key: 'lightblue',
        rgb: { r: 173, g: 216, b: 230 },
        hsl: { h: 195, s: 53, l: 79 }
    },
    {
        value: '#00BFFF',
        key: 'deepskyblue',
        rgb: { r: 0, g: 191, b: 255 },
        hsl: { h: 195, s: 100, l: 50 }
    },
    {
        value: '#87CEEB',
        key: 'skyblue',
        rgb: { r: 135, g: 206, b: 235 },
        hsl: { h: 197, s: 71, l: 73 }
    },
    {
        value: '#87CEFA',
        key: 'lightskyblue',
        rgb: { r: 135, g: 206, b: 250 },
        hsl: { h: 203, s: 92, l: 75 }
    },
    {
        value: '#4682B4',
        key: 'steelblue',
        rgb: { r: 70, g: 130, b: 180 },
        hsl: { h: 207, s: 44, l: 49 }
    },
    {
        value: '#F0F8FF',
        key: 'aliceblue',
        rgb: { r: 240, g: 248, b: 255 },
        hsl: { h: 208, s: 100, l: 97 }
    },
    {
        value: '#1E90FF',
        key: 'dodgerblue',
        rgb: { r: 30, g: 144, b: 255 },
        hsl: { h: 210, s: 100, l: 56 }
    },
    {
        value: '#708090',
        key: 'slategray',
        rgb: { r: 112, g: 128, b: 144 },
        hsl: { h: 210, s: 13, l: 50 }
    },
    {
        value: '#708090',
        key: 'slategrey',
        rgb: { r: 112, g: 128, b: 144 },
        hsl: { h: 210, s: 13, l: 50 }
    },
    {
        value: '#778899',
        key: 'lightslategray',
        rgb: { r: 119, g: 136, b: 153 },
        hsl: { h: 210, s: 14, l: 53 }
    },
    {
        value: '#778899',
        key: 'lightslategrey',
        rgb: { r: 119, g: 136, b: 153 },
        hsl: { h: 210, s: 14, l: 53 }
    },
    {
        value: '#B0C4DE',
        key: 'lightsteelblue',
        rgb: { r: 176, g: 196, b: 222 },
        hsl: { h: 214, s: 41, l: 78 }
    },
    {
        value: '#6495ED',
        key: 'cornflower',
        rgb: { r: 100, g: 149, b: 237 },
        hsl: { h: 219, s: 79, l: 66 }
    },
    {
        value: '#4169E1',
        key: 'royalblue',
        rgb: { r: 65, g: 105, b: 225 },
        hsl: { h: 225, s: 73, l: 57 }
    },
    {
        value: '#191970',
        key: 'midnightblue',
        rgb: { r: 25, g: 25, b: 112 },
        hsl: { h: 240, s: 64, l: 27 }
    },
    {
        value: '#E6E6FA',
        key: 'lavender',
        rgb: { r: 230, g: 230, b: 250 },
        hsl: { h: 240, s: 67, l: 94 }
    },
    {
        value: '#000080',
        key: 'navy',
        rgb: { r: 0, g: 0, b: 128 },
        hsl: { h: 240, s: 100, l: 25 }
    },
    {
        value: '#00008B',
        key: 'darkblue',
        rgb: { r: 0, g: 0, b: 139 },
        hsl: { h: 240, s: 100, l: 27 }
    },
    {
        value: '#0000CD',
        key: 'mediumblue',
        rgb: { r: 0, g: 0, b: 205 },
        hsl: { h: 240, s: 100, l: 40 }
    },
    {
        value: '#0000FF',
        key: 'blue',
        rgb: { r: 0, g: 0, b: 255 },
        hsl: { h: 240, s: 100, l: 50 }
    },
    {
        value: '#F8F8FF',
        key: 'ghostwhite',
        rgb: { r: 248, g: 248, b: 255 },
        hsl: { h: 240, s: 100, l: 99 }
    },
    {
        value: '#6A5ACD',
        key: 'slateblue',
        rgb: { r: 106, g: 90, b: 205 },
        hsl: { h: 248, s: 53, l: 58 }
    },
    {
        value: '#483D8B',
        key: 'darkslateblue',
        rgb: { r: 72, g: 61, b: 139 },
        hsl: { h: 248, s: 39, l: 39 }
    },
    {
        value: '#7B68EE',
        key: 'mediumslateblue',
        rgb: { r: 123, g: 104, b: 238 },
        hsl: { h: 249, s: 80, l: 67 }
    },
    {
        value: '#9370DB',
        key: 'mediumpurple',
        rgb: { r: 147, g: 112, b: 219 },
        hsl: { h: 260, s: 60, l: 65 }
    },
    {
        value: '#8A2BE2',
        key: 'blueviolet',
        rgb: { r: 138, g: 43, b: 226 },
        hsl: { h: 271, s: 76, l: 53 }
    },
    {
        value: '#4B0082',
        key: 'indigo',
        rgb: { r: 75, g: 0, b: 130 },
        hsl: { h: 275, s: 100, l: 25 }
    },
    {
        value: '#9932CC',
        key: 'darkorchid',
        rgb: { r: 153, g: 50, b: 204 },
        hsl: { h: 280, s: 61, l: 50 }
    },
    {
        value: '#9400D3',
        key: 'darkviolet',
        rgb: { r: 148, g: 0, b: 211 },
        hsl: { h: 282, s: 100, l: 41 }
    },
    {
        value: '#BA55D3',
        key: 'mediumorchid',
        rgb: { r: 186, g: 85, b: 211 },
        hsl: { h: 288, s: 59, l: 58 }
    },
    {
        value: '#D8BFD8',
        key: 'thistle',
        rgb: { r: 216, g: 191, b: 216 },
        hsl: { h: 300, s: 24, l: 80 }
    },
    {
        value: '#DDA0DD',
        key: 'plum',
        rgb: { r: 221, g: 160, b: 221 },
        hsl: { h: 300, s: 47, l: 75 }
    },
    {
        value: '#EE82EE',
        key: 'violet',
        rgb: { r: 238, g: 130, b: 238 },
        hsl: { h: 300, s: 76, l: 72 }
    },
    {
        value: '#800080',
        key: 'purple',
        rgb: { r: 128, g: 0, b: 128 },
        hsl: { h: 300, s: 100, l: 25 }
    },
    {
        value: '#8B008B',
        key: 'darkmagenta',
        rgb: { r: 139, g: 0, b: 139 },
        hsl: { h: 300, s: 100, l: 27 }
    },
    {
        value: '#FF00FF',
        key: 'fuchsia',
        rgb: { r: 255, g: 0, b: 255 },
        hsl: { h: 300, s: 100, l: 50 }
    },
    {
        value: '#FF00FF',
        key: 'magenta',
        rgb: { r: 255, g: 0, b: 255 },
        hsl: { h: 300, s: 100, l: 50 }
    },
    {
        value: '#DA70D6',
        key: 'orchid',
        rgb: { r: 218, g: 112, b: 214 },
        hsl: { h: 302, s: 59, l: 65 }
    },
    {
        value: '#C71585',
        key: 'mediumvioletred',
        rgb: { r: 199, g: 21, b: 133 },
        hsl: { h: 322, s: 81, l: 43 }
    },
    {
        value: '#FF1493',
        key: 'deeppink',
        rgb: { r: 255, g: 20, b: 147 },
        hsl: { h: 328, s: 100, l: 54 }
    },
    {
        value: '#FF69B4',
        key: 'hotpink',
        rgb: { r: 255, g: 105, b: 180 },
        hsl: { h: 330, s: 100, l: 71 }
    },
    {
        value: '#FFF0F5',
        key: 'lavenderblush',
        rgb: { r: 255, g: 240, b: 245 },
        hsl: { h: 340, s: 100, l: 97 }
    },
    {
        value: '#DB7093',
        key: 'palevioletred',
        rgb: { r: 219, g: 112, b: 147 },
        hsl: { h: 340, s: 60, l: 65 }
    },
    {
        value: '#DC143C',
        key: 'crimson',
        rgb: { r: 220, g: 20, b: 60 },
        hsl: { h: 348, s: 83, l: 47 }
    },
    {
        value: '#FFC0CB',
        key: 'pink',
        rgb: { r: 255, g: 192, b: 203 },
        hsl: { h: 350, s: 100, l: 88 }
    },
    {
        value: '#FFB6C1',
        key: 'lightpink',
        rgb: { r: 255, g: 182, b: 193 },
        hsl: { h: 351, s: 100, l: 86
        }
    }
];
const CACHE_COLORDATA: ObjectMap<ColorData> = {};
const CACHE_COLORRESULT = new Map<string, ColorResult>();

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

const convertOpacity = (value: string) => parseFloat(value) / (value.includes('%') ? 100 : 1);
const clampOpacity = (value: number) => clamp(value) * 255;

export function findColorName(value: string) {
    if (CACHE_COLORRESULT.size === 0) {
        for (let i = 0, length = COLOR_CSS3.length; i < length; ++i) {
            const color = COLOR_CSS3[i];
            CACHE_COLORRESULT.set(color.key, color);
        }
    }
    return CACHE_COLORRESULT.get(value.toLowerCase()) || null;
}

export function findColorShade(value: string) {
    const rgba = parseRGBA(value);
    if (rgba) {
        const hsl = convertHSLA(rgba);
        const result: ColorResult[] = [];
        let baseline = -1;
        for (let i = 0, length = COLOR_CSS3.length; i < length; ++i) {
            const color = COLOR_CSS3[i];
            if (color.value === value) {
                return color;
            }
            else if (baseline !== -1) {
                if (baseline === color.hsl.h) {
                    result.push(color);
                }
            }
            else if (hsl.h <= color.hsl.h) {
                result.push(color);
                baseline = color.hsl.h;
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
                const { l, s } = result[i].hsl;
                const offset = Math.abs(total - (l + s));
                if (offset < nearest) {
                    nearest = offset;
                    index = i;
                }
            }
            return result[index];
        }
        return COLOR_CSS3[COLOR_CSS3.length - 1];
    }
    return null;
}

export function parseColor(value: string, opacity = 1, transparency?: boolean) {
    if (value && (value !== 'transparent' || transparency)) {
        let colorData = CACHE_COLORDATA[value];
        if (colorData) {
            return colorData;
        }
        let key = '',
            rgba: Null<RGBA>;
        if (value[0] === '#') {
            rgba = parseRGBA(value);
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
                }
                else {
                    switch (value) {
                        case 'transparent':
                            rgba = { r: 0, g: 0, b: 0, a: 0 };
                            key = 'transparent';
                            break;
                        case 'initial':
                            rgba = { r: 0, g: 0, b: 0, a: 255 };
                            key = 'black';
                            break;
                        default: {
                            const color = findColorName(value);
                            if (color) {
                                rgba = { ...color.rgb, a: clampOpacity(opacity) } as RGBA;
                                key = value;
                            }
                            else {
                                rgba = null;
                            }
                            break;
                        }
                    }
                }
            }
        }
        if (rgba) {
            const a = rgba.a;
            if (a > 0 || transparency) {
                const hexAsString = getHexCode(rgba.r, rgba.g, rgba.b);
                const alphaAsString = getHexCode(a);
                const valueAsRGBA = `#${hexAsString + alphaAsString}`;
                if (CACHE_COLORDATA[valueAsRGBA]) {
                    return CACHE_COLORDATA[valueAsRGBA];
                }
                opacity = a / 255;
                value = `#${hexAsString}`;
                colorData = {
                    key,
                    value,
                    valueAsRGBA,
                    valueAsARGB: `#${alphaAsString + hexAsString}`,
                    rgba,
                    hsl: convertHSLA(rgba),
                    opacity,
                    transparent: opacity === 0
                } as ColorData;
                if (opacity === 1) {
                    CACHE_COLORDATA[value] = colorData;
                }
                CACHE_COLORDATA[valueAsRGBA] = colorData;
                return colorData;
            }
        }
    }
    return null;
}

export function reduceRGBA(value: RGBA, percent: number, cacheName?: string) {
    if (cacheName) {
        cacheName += '_' + percent;
        const colorData = CACHE_COLORDATA[cacheName];
        if (colorData) {
            return colorData;
        }
    }
    let { r, g, b } = value;
    if (r === 0 && g === 0 && b === 0) {
        r = 255;
        g = 255;
        b = 255;
        if (percent > 0) {
            percent *= -1;
        }
    }
    const base = percent < 0 ? 0 : 255;
    percent = Math.abs(percent);
    const result = parseColor(
        formatRGBA({
            r: (r + Math.round((base - r) * percent)) % 255,
            g: (g + Math.round((base - g) * percent)) % 255,
            b: (b + Math.round((base - b) * percent)) % 255,
            a: value.a
        })
    ) as ColorData;
    if (cacheName) {
        CACHE_COLORDATA[cacheName] = result;
    }
    return result;
}

export function getHexCode(...values: number[]) {
    let output = '';
    for (let i = 0, length = values.length; i < length; ++i) {
        const rgb = Math.max(0, Math.min(values[i], 255));
        output += isNaN(rgb) ? '00' : STRING_HEX.charAt((rgb - (rgb % 16)) / 16) + STRING_HEX.charAt(rgb % 16);
    }
    return output;
}

export function convertHex(value: RGBA) {
    return `#${getHexCode(value.r, value.g, value.b) + (value.a < 255 ? getHexCode(value.a) : '')}`;
}

export function parseRGBA(value: string) {
    if (CSS.HEX.test(value)) {
        value = value.substring(1);
        let a = 255;
        switch (value.length) {
            case 4:
                a = parseInt(value[3].repeat(2), 16);
            case 3:
                value = value[0].repeat(2) + value[1].repeat(2) + value[2].repeat(2);
                break;
            case 5:
                value += value[4];
                break;
            default:
                if (value.length >= 8) {
                    a = parseInt(value.substring(6, 8), 16);
                }
                value = value.substring(0, 6);
                break;
        }
        if (value.length === 6) {
            return {
                r: parseInt(value.substring(0, 2), 16),
                g: parseInt(value.substring(2, 4), 16),
                b: parseInt(value.substring(4), 16),
                a
            } as RGBA;
        }
    }
    return null;
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