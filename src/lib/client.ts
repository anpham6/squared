import { hasBit } from './util';

export const enum USER_AGENT {
    CHROME = 2,
    SAFARI = 4,
    FIREFOX = 8,
    EDGE = 16
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