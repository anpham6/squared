import { hasBit } from './util';

export const enum PLATFORM {
    WINDOWS = 1,
    MAC = 1 << 1,
    LINUX = 1 << 2
}

export const enum USER_AGENT {
    CHROME = 1,
    SAFARI = 1 << 1,
    FIREFOX = 1 << 2,
    EDGE = 1 << 3
}

export function isPlatform(value: NumString) {
    const platform = navigator.platform.toLowerCase();
    return typeof value === 'string' ? platform.includes(value.toLowerCase()) : hasBit(value, PLATFORM.WINDOWS) && platform.includes('win') || hasBit(value, PLATFORM.MAC) && /(mac|iphone|ipad|ipod)/.test(platform) || hasBit(value, PLATFORM.LINUX) && platform.includes('linux');
}

export function isUserAgent(value: NumString) {
    const userAgent = navigator.userAgent;
    let client = USER_AGENT.CHROME;
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
        client = USER_AGENT.SAFARI;
    }
    else if (userAgent.includes('Firefox/')) {
        client = USER_AGENT.FIREFOX;
    }
    else if (userAgent.includes('Edg/')) {
        client = USER_AGENT.EDGE;
    }
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
    return hasBit(value, client);
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}