import { PLATFORM, USER_AGENT } from './constant';

const CLIENT_USERAGENT = navigator.userAgentData;
let CLIENT_BROWSER = USER_AGENT.CHROME;
let CLIENT_VERSION: Undef<number[]>;

function setUserAgentData() {
    let version: Undef<string>;
    if (navigator.userAgent.indexOf('Chrom') !== -1) {
        const match = /(Chrom(?:e|ium)|Edg|OPR)\/([^ ]+)/.exec(navigator.userAgent);
        if (match) {
            switch (match[1]) {
                case 'Edg':
                    CLIENT_BROWSER = USER_AGENT.EDGE;
                    break;
                case 'OPR':
                    CLIENT_BROWSER = USER_AGENT.OPERA;
                    break;
            }
            version = match[2];
        }
    }
    else {
        const match = /(Safari|Firefox|Edge)\/([^ ]+)/.exec(navigator.userAgent);
        if (match) {
            switch (match[1]) {
                case 'Firefox':
                    CLIENT_BROWSER = USER_AGENT.FIREFOX;
                    break;
                case 'Edge':
                    CLIENT_BROWSER = USER_AGENT.EDGE_WIN;
                    break;
                default:
                    CLIENT_BROWSER = USER_AGENT.SAFARI;
                    break;
            }
            version = match[2];
        }
    }
    if (version) {
        CLIENT_VERSION = version.split('.').map(seg => +seg);
    }
}

export function isPlatform(value: NumString) {
    const platform = navigator.platform.toLowerCase();
    return typeof value === 'string' ? platform.indexOf(value.toLowerCase()) !== -1 : (value & PLATFORM.WINDOWS) > 0 && platform.indexOf('win') !== -1 || (value & PLATFORM.MAC) > 0 && /mac|iphone|ipad|ipod/.test(platform) || (value & PLATFORM.LINUX) > 0 && platform.indexOf('linux') !== -1;
}

export function isUserAgent(value: NumString, version?: unknown) {
    if (typeof value === 'string') {
        const name = value.toLowerCase();
        value = 0;
        if (name.indexOf('chrome') !== -1) {
            value |= USER_AGENT.CHROME;
        }
        if (name.indexOf('safari') !== -1) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.indexOf('firefox') !== -1) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.indexOf('edge') !== -1) {
            value |= USER_AGENT.EDGE;
        }
    }
    if (value & CLIENT_BROWSER) {
        if (!version) {
            return true;
        }
        if (CLIENT_VERSION) {
            switch (typeof version) {
                case 'number':
                    return CLIENT_VERSION[0] >= version;
                case 'string':
                    version = version.split('.');
                default:
                    if (!Array.isArray(version)) {
                        return false;
                    }
                    version = version.map(seg => +seg);
                    break;
            }
            const length = (version as number[]).length;
            if (length === 1) {
                return CLIENT_VERSION[0] >= (version as number[])[0];
            }
            else if (length > CLIENT_VERSION.length) {
                setUserAgentData();
            }
            for (let i = 0; i < length; ++i) {
                const offset = (version as number[])[i];
                if (!isNaN(offset)) {
                    const seg = CLIENT_VERSION[i];
                    if (seg > offset) {
                        break;
                    }
                    else if (seg < offset) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}

if (CLIENT_USERAGENT) {
    const brands = CLIENT_USERAGENT.brands;
    const items = ['Microsoft Edge', 'Opera', 'Chromium'];
    for (let i = 0; i < 3; ++i) {
        const brand = items[i];
        const browser = brands.find(item => item.brand === brand);
        if (browser) {
            if (i === 0) {
                CLIENT_BROWSER = USER_AGENT.EDGE;
            }
            else if (i === 1) {
                CLIENT_BROWSER = USER_AGENT.OPERA;
            }
            CLIENT_VERSION = [+browser.version];
            break;
        }
    }
}

if (!CLIENT_VERSION) {
    setUserAgentData();
}