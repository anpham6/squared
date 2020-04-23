import fs = require('fs-extra');
import path = require('path');
import parse  = require('csv-parse');
import puppeteer = require('puppeteer');
import recursive = require('recursive-readdir');
import md5 = require('md5');
import diff = require('diff');
import colors = require('colors');

const ARGV = process.argv;

let host: Undef<string>;
let data: Undef<string>;
let build: Undef<string>;
let master: Undef<string>;
let snapshot: Undef<string>;
let executablePath: Undef<string>;
let width = 1280;
let height = 960;
let flags = 1;

let i = 2;
while (i < ARGV.length) {
    switch (ARGV[i++]) {
        case '-h':
        case '-host':
            host = ARGV[i++].replace(/\/+$/, '');
            break;
        case '-d':
        case '-data':
            data = ARGV[i++];
            break;
        case '-b':
        case '-build':
            build = ARGV[i++];
            break;
        case '-f':
        case '-flags': {
            const mask = parseInt(ARGV[i++]);
            if (!isNaN(mask)) {
                flags = mask;
            }
            break;
        }
        case '-o':
        case '-output':
            snapshot = ARGV[i++];
            break;
        case '-v':
        case '-viewport': {
            const [w, h] = ARGV[i++].split('x').map(value => parseInt(value));
            if (!isNaN(w) && !isNaN(h)) {
                width = w;
                height = h;
            }
            break;
        }
        case '-e':
        case '-executable':
            executablePath = decodeURIComponent(ARGV[i++]);
            break;
        case '-c':
        case '-compare':
            master = ARGV[i++];
            snapshot = ARGV[i++];
            break;
    }
}

if (master) {
    if (snapshot) {
        const masterDir = path.resolve(__dirname, master);
        const snapshotDir = path.resolve(__dirname, snapshot);
        if (fs.existsSync(masterDir) && fs.existsSync(snapshotDir)) {
            const errors: string[] = [];
            for (const file of fs.readdirSync(masterDir)) {
                const filename = path.basename(file);
                const filepath = path.resolve(snapshotDir, path.basename(filename));
                if (fs.existsSync(filepath)) {
                    const output = diff.diffChars(
                        fs.readFileSync(path.resolve(masterDir, file)).toString('utf-8'),
                        fs.readFileSync(filepath).toString('utf-8')
                    );
                    if (output.length > 1) {
                        for (const part of output) {
                            if (part.removed) {
                                process.stderr.write(colors.red(part.value));
                            }
                            else if (!part.added) {
                                process.stderr.write(colors.grey(part.value));
                            }
                        }
                        console.log(`\nFAIL: ${filename}\n`);
                        errors.push(filename);
                    }
                }
                else {
                    errors.push(filename);
                    console.log(`WARN: MD5 not found (${filepath})`);
                }
            }
            if (errors.length) {
                console.log(`\n${colors.red('FAIL')}: ${errors.length} errors (${snapshot})\n\n${errors.join('\n')}`);
            }
            else {
                console.log(`${colors.green('SUCCESS')}: MD5 matched (${master} -> ${snapshot})`);
            }
        }
        else {
            console.log(`FAIL: Path not found (${masterDir} | ${snapshotDir})`);
        }
    }
}
else if (host && data && build && snapshot) {
    try {
        parse(fs.readFileSync(path.resolve(__dirname, data)), (error, csv: string[][]) => {
            if (error) {
                throw error;
            }
            else {
                const items: { name: string; filepath: string }[] = [];
                (async () => {
                    try {
                        const browser = await puppeteer.launch({
                            executablePath,
                            defaultViewport: { width, height }
                        });
                        console.log(`VERSION: ${await browser.version()}`);
                        const tempDir = path.resolve(__dirname, 'temp', build!);
                        try {
                            fs.emptyDirSync(tempDir);
                        }
                        catch (err) {
                            console.log(`WARN: ${err}`);
                        }
                        for (const row of csv) {
                            const [flag, filename, url] = row;
                            const id = parseInt(flag);
                            if (id > 0 && (flags & id) === id) {
                                const name = filename.substring(0, filename.lastIndexOf('.'));
                                const filepath = path.resolve(__dirname, 'temp', build!, name);
                                const href = host + url + '?copyTo=' + encodeURIComponent(filepath);
                                try {
                                    const page = await browser.newPage();
                                    page.on('error', err => {
                                        console.log(`WARN: ${err}`);
                                        page.close();
                                    });
                                    await page.goto(href);
                                    items.push({ name, filepath });
                                    console.log(`SUCCESS: ${href}`);
                                }
                                catch (err) {
                                    console.log(`FAIL: ${href} (${err})`);
                                }
                            }
                        }
                        const pathname = path.resolve(__dirname, snapshot!);
                        if (!fs.existsSync(pathname)) {
                            fs.mkdirpSync(pathname);
                        }
                        for (const item of items) {
                            const filepath = item.filepath;
                            recursive(filepath, (err, files) => {
                                if (!err) {
                                    files.sort();
                                    let output = '';
                                    for (const file of files) {
                                        output += md5(fs.readFileSync(file)) + '  .' + file.replace(filepath, '').replace(/[\\]/g, '/') + '\n';
                                    }
                                    fs.writeFileSync(path.resolve(pathname, item.name + '.md5'), output);
                                }
                            });
                        }
                        browser.close();
                    }
                    catch (err) {
                        console.log(`WARN: ${err}`);
                    }
                })();
            }
        });
    }
    catch (err) {
        console.log(`FAIL: Build incomplete (${err})`);
    }
}
else {
    if (!host) {
        console.log('REQUIRED: Host (-h http://localhost:3000)');
    }
    if (!data) {
        console.log('REQUIRED: CSV data (-d ./path/data.csv)');
    }
    if (!build) {
        console.log('REQUIRED: Build name (-b snapshot)');
    }
    if (!snapshot) {
        console.log('REQUIRED: Output directory (-o ./temp/snapshot)');
    }
}