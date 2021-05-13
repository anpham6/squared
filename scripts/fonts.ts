import fs = require('fs-extra');
import path = require('path');
import request = require('request');

type String = string | undefined;

interface Font {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: string[];
    category: string;
    kind: string;
}

let key: String;
let input: String;
let output: String;
{
    const args = process.argv.slice(2).reverse();
    while (args.length) {
        switch (args.pop()!) {
            case '-k':
            case '--key':
                key = args.pop()!;
                break;
            case '-i':
            case '--input':
                input = path.resolve(args.pop()!);
                break;
            case '-o':
            case '--output':
                output = path.resolve(args.pop()!);
                break;
        }
    }
}

if ((input || key) && output) {
    try {
        const resumeParse = (data: string) => {
            const items = JSON.parse(data).items as Font[];
            let result = '{';
            for (const { family, variants } of items) {
                const normal: string[] = [];
                const italic: string[] = [];
                const width = family.endsWith('Expanded') ? 125 : family.endsWith('Condensed') ? 75 : 0;
                for (const weight of variants) {
                    if (weight.endsWith('italic')) {
                        italic.push(`"${weight === 'italic' ? '400' : weight.substring(0, 3)}"`);
                    }
                    else {
                        normal.push(`"${weight === 'regular' ? '400' : weight}"`);
                    }
                }
                result += '\n\t"' + family + '": {' +
                          (normal.length ? '\n\t\t"normal": [' + normal.join(', ') + ']' + (italic.length || width ? ',' : '') : '') +
                          (italic.length ? '\n\t\t"italic": [' + italic.join(', ') + ']' + (width ? ',' : '') : '') +
                          (width ? '\n\t\t"width": "' + width + '"' : '') +
                          '\n\t},';
            }
            fs.writeFileSync(output!, result.substring(0, result.length - 1) + '\n}', 'utf8');
            console.log(`SUCCESS: File created (${output!})`);
        };
        if (key) {
            request('https://www.googleapis.com/webfonts/v1/webfonts?key=' + key, (err, res) => {
                if (!err) {
                    resumeParse(res.body);
                }
            });
        }
        else {
            fs.readFile(input!, 'utf8', (err, data) => {
                if (!err) {
                    resumeParse(data);
                }
            });
        }
    }
    catch (err) {
        console.log(`FAIL: Build incomplete (${err as string})`);
    }
}