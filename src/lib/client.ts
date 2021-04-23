import { PLATFORM, USER_AGENT } from './constant';

let CLIENT_BROWSER = USER_AGENT.CHROME;
let CLIENT_VERSION: string | number[] = '';

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
        CLIENT_VERSION = match[2];
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
        CLIENT_VERSION = match[2];
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
            if (typeof CLIENT_VERSION === 'string') {
                CLIENT_VERSION = CLIENT_VERSION.split('.').map(seg => +seg);
            }
            switch (typeof version) {
                case 'string':
                    version = version.split('.').map(seg => +seg);
                    break;
                case 'number':
                    version = [version];
                    break;
            }
            if (Array.isArray(version)) {
                for (let i = 0, length = Math.min(version.length, CLIENT_VERSION.length); i < length; ++i) {
                    const offset = +version[i];
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
    }
    return false;
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}