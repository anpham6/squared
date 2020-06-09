import { hasBit } from './util';

export const enum PLATFORM {
    WINDOWS = 2,
    MAC = 4
}

export const enum USER_AGENT {
    CHROME = 2,
    SAFARI = 4,
    FIREFOX = 8,
    EDGE = 16
}

export function isPlatform(value: string | number) {
    const platform = navigator.platform.toLowerCase();
    if (typeof value === 'string') {
        return platform.includes(value.toLowerCase());
    }
    return hasBit(value, PLATFORM.WINDOWS) && platform.includes('win') || hasBit(value, PLATFORM.MAC) && /(mac|iphone|ipad|ipod)/.test(platform);
}

export function isUserAgent(value: string | number) {
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
        const name = value.toUpperCase();
        value = 0;
        if (name.includes('CHROME')) {
            value |= USER_AGENT.CHROME;
        }
        if (name.includes('SAFARI')) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.includes('FIREFOX')) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.includes('EDGE')) {
            value |= USER_AGENT.EDGE;
        }
    }
    return hasBit(value, client);
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}