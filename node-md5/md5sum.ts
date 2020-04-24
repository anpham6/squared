import fs = require('fs-extra');
import path = require('path');
import parse  = require('csv-parse');
import puppeteer = require('puppeteer');
import recursive = require('recursive-readdir');
import md5 = require('md5');
import diff = require('diff');
import colors = require('colors');

type PageRequest = { name: string; filepath: string; files?: string[] };

let host: Undef<string>;
let data: Undef<string>;
let build: Undef<string>;
let master: Undef<string>;
let snapshot: Undef<string>;
let executablePath: Undef<string>;
let width = 1280;
let height = 960;
let flags = 1;
let timeout = 5 * 60 * 1000;
{
    const ARGV = process.argv;
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
                const f = parseInt(ARGV[i++]);
                if (!isNaN(f)) {
                    flags = f;
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
            case '-t':
            case '-timeout': {
                const t = parseInt(ARGV[i++]);
                if (!isNaN(t) && t > 0) {
                    timeout = t * 60 * 1000;
                }
                break;
            }
        }
    }
}

const failMessage = (message: string, err: any, listing?: string[]) => console.log('\n' + colors.red('FAIL') + `: ${message} (${err})\n` + (listing ? '\n' + listing.join('\n') + '\n' : ''));
const warnMessage = (message: string, err: any) => console.log('\n' + colors.yellow('WARN') + `: ${message} (${err})\n`);
const successMessage = (message: string, err: any) => console.log('\n' + colors.green('SUCCESS') + `: ${message} (${err})\n`);

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
                        failMessage('MD5 not matched', filename);
                        errors.push(filename);
                    }
                }
                else {
                    errors.push(filename);
                    warnMessage('MD5 not found', filepath);
                }
            }
            if (errors.length) {
                failMessage(errors.length + ' errors', snapshot, errors);
            }
            else {
                successMessage('MD5 matched', master + ' -> ' + snapshot);
            }
        }
        else {
            failMessage('Path not found', masterDir + ' | ' + snapshotDir);
        }
    }
}
else if (host && data && build && snapshot) {
    try {
        const timeStart = Date.now();
        parse(fs.readFileSync(path.resolve(__dirname, data)), (error, csv: string[][]) => {
            if (error) {
                throw error;
            }
            else {
                const items: PageRequest[] = [];
                const failed: PageRequest[] = [];
                (async () => {
                    try {
                        const browser = await puppeteer.launch({
                            executablePath,
                            defaultViewport: { width, height }
                        });
                        console.log(colors.blue('VERSION') + ': ' + colors.bold(await browser.version()));
                        const tempDir = path.resolve(__dirname, 'temp', build!);
                        try {
                            fs.emptyDirSync(tempDir);
                        }
                        catch (err) {
                            failMessage(tempDir, err);
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
                                        failMessage(href, err);
                                        page.close();
                                    });
                                    await page.goto(href);
                                    await page.waitFor('#md5_complete', { timeout });
                                    const files = (await page.$eval('#md5_complete', e => e.innerHTML)).split('\n').sort();
                                    items.push({ name, filepath, files });
                                    console.log(colors.yellow('OK') + ': ' + href);
                                }
                                catch (err) {
                                    failed.push({ name, filepath });
                                    failMessage(href, err);
                                }
                            }
                        }
                        const pathname = path.resolve(__dirname, snapshot!);
                        if (!fs.existsSync(pathname)) {
                            fs.mkdirpSync(pathname);
                        }
                        for (let i = 0; i < items.length; ++i) {
                            const item = items[i];
                            const filepath = item.filepath;
                            recursive(filepath, (err, files) => {
                                if (!err) {
                                    files.sort();
                                    let output = '';
                                    for (const file of files) {
                                        output += md5(fs.readFileSync(file)) + '  .' + file.replace(filepath, '').replace(/[\\]/g, '/') + '\n';
                                    }
                                    fs.writeFileSync(path.resolve(pathname, `${item.name}.md5`), output);
                                }
                                if (i === items.length - 1) {
                                    const message = '+' + colors.green(items.length.toString()) + ' -' + colors.red(failed.length.toString());
                                    const timeElapsed = ((Date.now() - timeStart) / 60000).toPrecision(5) + 'm';
                                    if (failed.length === 0) {
                                        successMessage(message, timeElapsed);
                                    }
                                    else {
                                        failMessage(message, timeElapsed);
                                    }
                                    process.exit();
                                }
                            });
                        }
                    }
                    catch (err) {
                        failMessage('Unknown', err);
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