import fs = require('fs-extra');
import path = require('path');
import glob = require('glob');

const ARGV = process.argv;

const files: string[] = ['squared', ''];
const extensions: string[] = [];
let framework: Undef<string>;
let output: Undef<string>;

const isFile = (value: string) => fs.lstatSync(value).isFile();

for (let i = 2; i < ARGV.length; i += 2) {
    const arg = ARGV[i + 1];
    switch (ARGV[i]) {
        case '-f':
        case '-framework': {
            const name = arg.toLowerCase();
            switch (name) {
                case 'android':
                case 'chrome':
                    files[1] = 'squared.base';
                    framework = `${name}.framework`;
                    break;
            }
            break;
        }
        case '-m':
        case '-modules': {
            arg.split(',').forEach(value => {
                const module = value.toLowerCase();
                switch (module) {
                    case 'svg':
                        files.push(`squared.${module}`);
                        break;
                }
            });
            break;
        }
        case '-e':
        case '-extensions':
            arg.split(',').forEach(value => {
                const include: string[] = [];
                if (value.indexOf('*') !== -1) {
                    glob.sync(path.resolve(`dist/extensions/${value}`)).forEach(filepath => {
                        if (filepath.endsWith('.min.js')) {
                            include.push(filepath);
                        }
                    });
                }
                else {
                    include.push(path.resolve(`dist/extensions/${value}.min.js`));
                }
                include.forEach(filepath => {
                    if (isFile(filepath)) {
                        extensions.push(filepath);
                    }
                });
            });
            break;
        case '-o':
        case '-output':
            output = path.resolve(arg);
            break;
    }
}

if (framework) {
    files.push(framework);
}

if (output) {
    try {
        let content = '';
        let fail = '';
        for (let value of files) {
            if (value) {
                value = path.resolve(`dist/${value}.min.js`);
                if (isFile(value)) {
                    content += fs.readFileSync(value);
                }
                else {
                    fail = value;
                    break;
                }
            }
        }
        for (const value of extensions) {
            content += fs.readFileSync(value);
        }
        if (fail === '') {
            const dirname = path.dirname(output);
            if (!fs.existsSync(dirname)) {
                fs.mkdirpSync(dirname);
            }
            fs.writeFile(output, content, err => {
                if (err) {
                    throw err;
                }
                else {
                    console.log(`WRITE: Bundle created (${output})`);
                }
            });
        }
        else {
            throw Error(fail);
        }
    }
    catch (err) {
        console.log(`FAIL: Build incomplete (${err})`);
    }
}