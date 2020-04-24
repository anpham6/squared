import fs = require('fs-extra');
import path = require('path');
import parse  = require('csv-parse');
import puppeteer = require('puppeteer');
import readdirp = require('readdirp');
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

function formatTime(start: number) {
    let time = Date.now() - start;
    const h = Math.floor(time / (60 * 60 * 1000));
    time -= h * (60 * 60 * 1000);
    const m = Math.floor(time / (60 * 1000));
    time -= m * (60 * 1000);
    const s = Math.floor(time / 1000);
    time -= s * 1000;
    return `${h}h ${m}m ${s}s ${time}ms`;
}

const failMessage = (message: string, status: any, listing?: string[]) => console.log('\n' + colors.bold(colors.red('FAIL')) + `: ${message} (${status})\n` + (listing ? '\n' + listing.join('\n') + '\n' : ''));
const warnMessage = (message: string, status: string) => console.log('\n' + colors.yellow('WARN') + `: ${message} (${status})`);
const requiredMessage = (message: string, status: string) => console.log(colors.bold(colors.yellow('REQUIRED')) + `: ${message} (${colors.grey(status)})`);
const successMessage = (message: string, status: string) => console.log('\n' + colors.bold(colors.green('SUCCESS')) + `: ${message} ` + colors.yellow('[') + colors.grey(status) + colors.yellow(']') + '\n');

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
                        errors.push(filename);
                        failMessage('MD5 not matched', filename);
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
                        console.log(colors.blue('VERSION') + ': ' + colors.bold(await browser.version()) + '\n');
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
                        console.log('');
                        for (const item of items) {
                            const { name, filepath } = item;
                            const files = await readdirp.promise(filepath);
                            files.sort((a, b) => a.path < b.path ? -1 : 1);
                            let output = '';
                            for (const file of files) {
                                output += md5(fs.readFileSync(file.fullPath)) + '  ./' + file.path.replace(/[\\]/g, '/') + '\n';
                            }
                            fs.writeFileSync(path.resolve(pathname, `${name}.md5`), output);
                            process.stderr.write(colors.bgBlue(colors.bold(colors.white('>'))));
                        }
                        console.log('');
                        const message = '+' + colors.green(items.length.toString()) + ' -' + colors.red(failed.length.toString());
                        if (failed.length === 0) {
                            successMessage(message, formatTime(timeStart));
                        }
                        else {
                            failMessage(message, formatTime(timeStart));
                        }
                        process.exit();
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
    console.log('');
    if (!host) {
        requiredMessage('Host', '-h http://localhost:3000');
    }
    if (!data) {
        requiredMessage('CSV data', '-d ./path/data.csv');
    }
    if (!build) {
        requiredMessage('Build name', '-b snapshot');
    }
    if (!snapshot) {
        requiredMessage('Output directory', '-o ./temp/snapshot');
    }
    console.log('');
}