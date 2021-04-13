const { splitPair, splitSome } = squared.lib.util;

export function parseTask(value: Undef<string>) {
    if (value) {
        const result: TaskAction[] = [];
        splitSome(value, item => {
            const [handler, command] = splitPair(item, ':', true);
            if (handler && command) {
                const [task, preceding] = splitPair(command, ':', true);
                result.push({ handler, task, preceding: preceding === 'true' });
            }
        }, '+');
        return result;
    }
}

export function parseWatchInterval(value: Undef<string>) {
    if (value && (value = value.trim())) {
        if (value === 'true') {
            return true;
        }
        const match = /^(?:^|\s+)(~|\d+)\s*(?:::\s*(~|.+?)\s*(?:::\s*(.+?)(?:\[([^\]]+)\])?)?)?(?:\s+|$)$/.exec(value);
        if (match) {
            let interval: Undef<number>,
                expires: Undef<string>,
                reload: Undef<WatchReload>;
            if (match[1] !== '~' && !isNaN(+match[1])) {
                interval = +match[1];
            }
            if (match[2]) {
                if (match[2] !== '~') {
                    expires = match[2].trim();
                }
                if (match[3]) {
                    const [socketId, port] = splitPair(match[3], ':', true, true);
                    let secure: Undef<boolean>,
                        module: Undef<boolean>;
                    if (match[4]) {
                        secure = match[4].indexOf('secure') !== -1;
                        module = match[4].indexOf('module') !== -1;
                    }
                    reload = { socketId: socketId !== '~' ? socketId : '', port: port && !isNaN(+port) ? +port : undefined, secure, module };
                }
            }
            return { interval, expires, reload } as WatchInterval;
        }
    }
}