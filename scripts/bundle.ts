import fs = require('fs-extra');
import path = require('path');
import glob = require('glob');

type String = string | undefined;

const isFile = (value: string) => fs.lstatSync(value).isFile();

const files: string[] = ['squared', ''];
const extensions: string[] = [];
let framework: String;
let install: String;
let output: String;
{
    const ARGV = process.argv;
    let i = 2;
    while (i < ARGV.length) {
        const option = ARGV[i++];
        const value = ARGV[i++];
        switch (option) {
            case '-f':
            case '--framework': {
                const name = value.toLowerCase();
                switch (name) {
                    case 'base':
                        files[1] = 'squared.base';
                        break;
                    case 'android':
                        files[1] = 'squared.base';
                        framework = 'android.framework';
                        break;
                    case 'chrome':
                    case 'vdom':
                        files[1] = 'squared.base-dom';
                    case 'vdom-lite':
                        framework = `${name}.framework`;
                        break;
                }
                switch (name) {
                    case 'android':
                    case 'chrome':
                        install = name;
                        break;
                    case 'vdom':
                    case 'vdom-lite':
                        install = 'vdom';
                        break;
                }
                break;
            }
            case '-m':
            case '--modules':
                for (const item of value.split(',')) {
                    const module = item.toLowerCase();
                    switch (module) {
                        case 'svg':
                            files.push(`squared.${module}`);
                            break;
                    }
                }
                break;
            case '-e':
            case '--extensions':
                for (const item of value.split(',')) {
                    const include: string[] = [];
                    if (item.includes('*')) {
                        for (const filepath of glob.sync(path.resolve(`dist/extensions/${item}`))) {
                            if (filepath.endsWith('.min.js')) {
                                include.push(filepath);
                            }
                        }
                    }
                    else {
                        include.push(path.resolve(`dist/extensions/${item}.min.js`));
                    }
                    for (const filepath of include) {
                        if (isFile(filepath)) {
                            extensions.push(filepath);
                        }
                    }
                }
                break;
            case '-o':
            case '--output':
                output = path.resolve(value);
                break;
        }
    }
}

if (framework) {
    files.push(framework);
}

if (output) {
    try {
        let content = '';
        for (let value of files) {
            if (value) {
                value = path.resolve(`dist/${value}.min.js`);
                if (isFile(value)) {
                    content += fs.readFileSync(value);
                }
                else {
                    throw Error(value);
                }
            }
        }
        content = extensions.reduce((a, b) => a + fs.readFileSync(b), content);
        const dirname = path.dirname(output);
        if (!fs.existsSync(dirname)) {
            fs.mkdirpSync(dirname);
        }
        if (install) {
            content += `squared.setFramework(${install});`;
        }
        fs.writeFile(output, content, err => {
            if (err) {
                throw err;
            }
            else {
                console.log(`WRITE: Bundle created (${output!})`);
            }
        });
    }
    catch (err) {
        console.log(`FAIL: Build incomplete (${err as string})`);
    }
}