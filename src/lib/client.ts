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
        return platform.indexOf(value.toLowerCase()) !== -1;
    }
    return (
        hasBit(value, PLATFORM.WINDOWS) && platform.indexOf('windows') !== -1 ||
        hasBit(value, PLATFORM.MAC) && /mac|iphone|ipad/.test(platform)
    );
}

export function isUserAgent(value: string | number) {
    if (typeof value === 'string') {
        const name = value.toUpperCase();
        value = 0;
        if (name.indexOf('CHROME') !== -1) {
            value |= USER_AGENT.CHROME;
        }
        if (name.indexOf('SAFARI') !== -1) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.indexOf('FIREFOX') !== -1) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.indexOf('EDGE') !== -1) {
            value |= USER_AGENT.EDGE;
        }
    }
    const userAgent = navigator.userAgent;
    let client = USER_AGENT.CHROME;
    if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
        client = USER_AGENT.SAFARI;
    }
    else if (userAgent.indexOf('Firefox') !== -1) {
        client = USER_AGENT.FIREFOX;
    }
    else if (userAgent.indexOf('Edge') !== -1) {
        client = USER_AGENT.EDGE;
    }
    return hasBit(value, client);
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}