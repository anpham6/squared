import { PLATFORM, USER_AGENT } from './constant';

let CLIENT_BROWSER = USER_AGENT.CHROME;
let CLIENT_VERSION: string | number[] = '';

if (navigator.userAgent.includes('Chrom')) {
    const match = /(Chrom(?:e|ium)|Edg)\/([^ ]+)/.exec(navigator.userAgent);
    if (match) {
        if (match[1] === 'Edg') {
            CLIENT_BROWSER = USER_AGENT.EDGE;
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
    return typeof value === 'string' ? platform.includes(value.toLowerCase()) : (value & PLATFORM.WINDOWS) > 0 && platform.includes('win') || (value & PLATFORM.MAC) > 0 && /mac|iphone|ipad|ipod/.test(platform) || (value & PLATFORM.LINUX) > 0 && platform.includes('linux');
}

export function isUserAgent(value: NumString, version?: unknown) {
    if (typeof value === 'string') {
        const name = value.toLowerCase();
        value = 0;
        if (name.includes('chrome')) {
            value |= USER_AGENT.CHROME;
        }
        if (name.includes('safari')) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.includes('firefox')) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.includes('edge')) {
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