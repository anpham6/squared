import fs = require('fs-extra');
import path = require('path');
import parse = require('csv-parse');
import puppeteer = require('puppeteer');
import readdirp = require('readdirp');
import md5 = require('md5');
import diff = require('diff');
import chalk = require('chalk');

type String = string | undefined;

interface PageRequest {
    name: string;
    filepath: string;
    files?: string[];
}

let host: String;
let data: String;
let browserName: "chromium"| "firefox" | "webkit" | undefined;
let master: String;
let snapshot: String;
let executablePath: String;
let modifiedDate: Date | undefined;
let width = 1280;
let height = 960;
let flags = 1;
let timeout = 10 * 1000;
let screenshot = false;
let rebase = false;
let extension = 'md5';
{
    const ARGV = process.argv;
    let i = 2;
    while (i < ARGV.length) {
        const option = ARGV[i++];
        switch (option) {
            case '-h':
            case '--host':
                host = ARGV[i++].replace(/\/+$/, '');
                break;
            case '-d':
            case '--data':
                data = ARGV[i++];
                break;
            case '-b':
            case '--browser': {
                const value = ARGV[i++];
                switch (value) {
                    case 'chromium':
                    case 'firefox':
                    case 'webkit':
                        browserName = value;
                        break;
                }
                break;
            }
            case '-f':
            case '--flags': {
                const f = parseInt(ARGV[i++]);
                if (!isNaN(f)) {
                    flags = f;
                }
                break;
            }
            case '-o':
            case '--output':
                snapshot = ARGV[i++];
                break;
            case '-v':
            case '--viewport':
            case '-s':
            case '--screenshot': {
                const [w, h] = ARGV[i++].split('x').map(dimension => parseInt(dimension));
                if (!isNaN(w) && !isNaN(h)) {
                    width = w;
                    height = h;
                    if (option.startsWith('-s')) {
                        screenshot = true;
                    }
                }
                break;
            }
            case '-e':
            case '--executable':
                executablePath = decodeURIComponent(ARGV[i++]);
                break;
            case '-c':
            case '--compare':
                master = ARGV[i++];
                snapshot = ARGV[i++];
                break;
            case '-z':
            case '--rebase':
                rebase = true;
                break;
            case '-x':
            case '--extension':
                extension = ARGV[i++];
                break;
            case '-r':
            case '--raw':
                screenshot = true;
                break;
            case '-m':
            case '--modified':
                master = ARGV[i++];
                modifiedDate = new Date(ARGV[i++]);
                break;
            case '-t':
            case '--timeout': {
                const t = parseFloat(ARGV[i++]);
                if (!isNaN(t) && t > 0) {
                    timeout = t * 1000;
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

const failMessage = (message: string, status = '') => console.log('\n' + chalk.bold.red('FAIL') + `: ${message} ` + (status && getStatus(status)) + '\n');
const warnMessage = (message: string, status: string) => console.log(chalk.yellow('WARN') + `: ${message} (${chalk.grey(status)})`);
const requiredMessage = (message: string, status: string) => console.log(chalk.bold.yellow('REQUIRED') + `: ${message} ` + getStatus(status));
const successMessage = (message: string, status: string) => console.log('\n\n' + chalk.bold.green('SUCCESS') + `: ${message} ` + getStatus(status) + '\n');
const getStatus = (status: string) => chalk.yellow('[') + chalk.grey(status) + chalk.yellow(']');

if (master) {
    const masterDir = path.resolve(__dirname, master);
    if (fs.existsSync(masterDir)) {
        if (modifiedDate) {
            if (data && host) {
                parse(fs.readFileSync(path.resolve(__dirname, data)), (err, csv: string[][]) => {
                    if (!err) {
                        let html = '<html><body><ol>',
                            modified = 0;
                        for (const row of csv) {
                            const id = parseInt(row[0]);
                            if (id > 0 && (flags & id) === id) {
                                const filename = row[1];
                                const file = path.resolve(masterDir, filename);
                                if (fs.existsSync(file)) {
                                    if (fs.statSync(file).mtime >= modifiedDate!) {
                                        const href = host + row[2];
                                        html += `<li><a href="${href}">${href}</a> (${filename})</li>`;
                                        ++modified;
                                        warnMessage(href, filename);
                                    }
                                }
                                else {
                                    warnMessage('MD5 not found', file);
                                }
                            }
                        }
                        html += '</ol></body></html>';
                        if (modified) {
                            const pathname = `tmp${master!.substring(1)}.html`;
                            fs.mkdirpSync(path.dirname(pathname));
                            fs.writeFileSync(path.resolve(__dirname, pathname), html);
                            successMessage(modified + ' modifications', host + '/' + pathname);
                        }
                        else {
                            successMessage('MD5 unmodified', master!);
                        }
                    }
                    else {
                        failMessage("Unable to read CSV data file", data);
                    }
                });
            }
        }
        else if (snapshot) {
            const snapshotDir = path.resolve(__dirname, snapshot);
            if (fs.existsSync(snapshotDir)) {
                const errors: string[] = [];
                const notFound: string[] = [];
                const stderr = process.stderr;
                for (const file of fs.readdirSync(masterDir)) {
                    if (!file.endsWith('.' + extension)) {
                        continue;
                    }
                    const filename = path.basename(file);
                    const filepath = path.resolve(snapshotDir, path.basename(filename));
                    if (fs.existsSync(filepath)) {
                        const masterpath = path.resolve(masterDir, filename);
                        if (screenshot) {
                            if (md5(fs.readFileSync(filepath)) !== md5(fs.readFileSync(masterpath))) {
                                stderr.write(chalk.bgWhite.black('-'.repeat(100)) + '\n\n');
                                stderr.write(chalk.yellow(masterpath) + '\n' + chalk.grey(filepath) + '\n\n');
                                errors.push(filename);
                            }
                            else {
                                stderr.write(chalk.bgBlue.white('>'));
                            }
                        }
                        else {
                            const output = diff.diffChars(
                                fs.readFileSync(masterpath).toString('utf-8'),
                                fs.readFileSync(filepath).toString('utf-8')
                            );
                            if (output.length > 1) {
                                if (rebase) {
                                    stderr.write(chalk.bgWhite.blue('<'));
                                    fs.copyFileSync(filepath, masterpath);
                                }
                                else {
                                    const pngpath = filepath.replace('.md5', '.png');
                                    stderr.write('\n\n' + chalk.bgWhite.black('-'.repeat(100)) + '\n\n');
                                    stderr.write(chalk.yellow(masterpath) + '\n' + chalk.grey(filepath) + '\n' + (fs.existsSync(pngpath) ? chalk.blue(pngpath) + '\n' : '') + '\n');
                                    for (const part of output) {
                                        if (part.removed) {
                                            stderr.write(chalk.yellow(part.value));
                                        }
                                        else if (!part.added) {
                                            stderr.write(chalk.grey(part.value));
                                        }
                                    }
                                    stderr.write('\n');
                                    errors.push(filename);
                                }
                            }
                            else {
                                stderr.write(chalk.bgBlue.white('>'));
                            }
                        }
                    }
                    else {
                        notFound.push(filename);
                        stderr.write(chalk.bgBlue.black('?'));
                    }
                }
                if (errors.length || notFound.length) {
                    stderr.write('\n\n');
                    if (data && host) {
                        parse(fs.readFileSync(path.resolve(__dirname, data)), (err, csv: string[][]) => {
                            if (!err) {
                                let html = '<html><body><ol>';
                                for (const row of csv) {
                                    const filename = row[1];
                                    const url = row[2];
                                    if (errors.includes(filename)) {
                                        const href = host + url;
                                        html += `<li><a href="${href}">${href}</a> (${filename})</li>`;
                                        warnMessage('MD5 not matched -> ' + href, filename);
                                    }
                                    else if (notFound.includes(filename)) {
                                        warnMessage('MD5 not found', filename);
                                    }
                                }
                                html += '</ol></body></html>';
                                fs.writeFileSync(path.resolve(__dirname, snapshot!, 'errors.html'), html);
                                failMessage((errors.length + notFound.length) + ' errors', host + snapshot!.replace(/^[.]/, '') + '/errors.html');
                            }
                            else {
                                failMessage("Unable to read CSV data file", data);
                            }
                        });
                    }
                    else {
                        for (const value of errors) {
                            warnMessage('MD5 not matched', value);
                        }
                        for (const value of notFound) {
                            warnMessage('MD5 not found', value);
                        }
                        failMessage((errors.length + notFound.length) + ' errors', snapshot);
                    }
                }
                else if (rebase) {
                    successMessage('MD5 rebase', snapshot + ' -> ' + master);
                }
                else {
                    successMessage('MD5 matched', master + ' -> ' + snapshot);
                }
            }
            else {
                failMessage('Path not found', snapshotDir);
            }
        }
    }
    else {
        failMessage('Path not found', masterDir);
    }
}
else if (host && data && browserName && snapshot) {
    try {
        const timeStart = Date.now();
        parse(fs.readFileSync(path.resolve(__dirname, data)), async (error, csv: string[][]) => {
            if (error) {
                throw error;
            }
            else {
                try {
                    const items: PageRequest[] = [];
                    const failed: PageRequest[] = [];
                    const browser = await puppeteer.launch({ executablePath });
                    const tempDir = path.resolve(__dirname, snapshot!);
                    try {
                        fs.emptyDirSync(tempDir);
                    }
                    catch (err) {
                        failMessage(tempDir, err);
                    }
                    console.log(`${chalk.blue('VERSION')}: ${chalk.bold(await browser.version())}\n`);
                    for (const row of csv) {
                        const [flag, filename, url] = row;
                        const id = parseInt(flag);
                        if (id > 0 && (flags & id) === id) {
                            const name = filename.substring(0, filename.lastIndexOf('.'));
                            const filepath = path.resolve(__dirname, snapshot!, name);
                            const href = host + url;
                            let page: puppeteer.Page | undefined;
                            try {
                                page = await browser.newPage();
                                await page.setViewport({ width, height });
                                await page.goto(href + '?copyTo=' + encodeURIComponent(filepath));
                                if (screenshot) {
                                    await page.screenshot({ path: filepath + '.png' });
                                }
                                await page.waitForSelector('#md5_complete', { timeout });
                                const files = (await page.$eval('#md5_complete', element => element.innerHTML)).split('\n').sort();
                                items.push({ name, filepath, files });
                                console.log(chalk.yellow('OK') + ': ' + href);
                            }
                            catch (err) {
                                failed.push({ name, filepath });
                                failMessage(href, err);
                            }
                            if (page) {
                                await page.close();
                            }
                        }
                    }
                    const stderr = process.stderr;
                    const pathname = path.resolve(__dirname, snapshot!);
                    fs.mkdirpSync(pathname);
                    console.log('');
                    for (const item of items) {
                        const files = await readdirp.promise(item.filepath);
                        files.sort((a, b) => a.path < b.path ? -1 : 1);
                        const output = files.reduce((a, b) => a + md5(fs.readFileSync(b.fullPath)) + '  ./' + b.path.replace(/\\/g, '/') + '\n', '');
                        fs.writeFileSync(path.resolve(pathname, item.name + '.md5'), output);
                        stderr.write(chalk.bgBlue.bold(item.files!.length !== files.length ? chalk.black('!') : chalk.white('>')));
                    }
                    const message = '+' + chalk.green(items.length.toString()) + ' -' + chalk.red(failed.length.toString());
                    if (failed.length === 0) {
                        successMessage(message, formatTime(timeStart));
                    }
                    else {
                        console.log('');
                        failMessage(message, formatTime(timeStart));
                    }
                    process.exit();
                }
                catch (err) {
                    failMessage('Unknown', err);
                }
            }
        });
    }
    catch (err) {
        console.log(`FAIL: Build incomplete (${err as string})`);
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
    if (!browserName) {
        requiredMessage('Browser', '-b chromium');
    }
    if (!snapshot) {
        requiredMessage('Output directory', '-o ./tmp/chromium');
    }
    console.log('');
}