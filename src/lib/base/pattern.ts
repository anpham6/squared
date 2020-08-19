export default class Pattern implements squared.lib.base.Pattern {
    public found = 0;

    private _input = '';
    private _current: Null<RegExpExecArray> = null;
    private _matcher!: RegExp;

    constructor(expression: string | RegExp, flags?: string) {
        this.usePattern(expression, flags);
    }

    public matcher(input: string) {
        if (this.found === 0) {
            this._input = input;
        }
        else {
            this.reset(input);
        }
    }

    public find(start?: number) {
        if (start !== undefined) {
            this.reset();
            start = Math.max(0, start);
        }
        else {
            start = 0;
        }
        while (this._current = this._matcher.exec(this._input)) {
            ++this.found;
            if (start-- === 0) {
                return true;
            }
        }
        return false;
    }

    public lookingAt() {
        return this.find(0) && this._matcher.lastIndex === 0;
    }

    public matches() {
        return this.find(0) && this._current![0].length === this._input.length;
    }

    public start(index = 0) {
        const current = this._current;
        if (current && index >= 0) {
            let pos = current.index,
                i = 0;
            while (index > 0) {
                if (current[i]) {
                    pos += current[i++].length;
                    --index;
                }
                else {
                    return -1;
                }
            }
            return pos;
        }
        return -Infinity;
    }

    public end(index = 0) {
        const current = this._current;
        if (current && index >= 0) {
            let pos = current.index + current[0].length,
                i = 1;
            while (index > 0) {
                if (current[i]) {
                    pos += current[i++].length;
                    --index;
                }
                else {
                    return this._input.length;
                }
            }
            return pos;
        }
        return Infinity;
    }

    public group(index: NumString = 0) {
        return this._current ? typeof index === 'number' ? this._current[index] : this._current.groups?.[index] : undefined;
    }

    public groups(start = 0, end?: number) {
        if (end !== undefined) {
            ++end;
        }
        else if (start === 0) {
            return this._current as string[];
        }
        return this._current?.slice(start, end) || [];
    }

    public groupCount() {
        return this._current?.length || 0;
    }

    public map<U>(predicate: IteratorPredicate<string, U>, start = 0, end?: number): U[] {
        const current = this._current;
        if (current) {
            if (end === undefined) {
                end = current.length;
            }
            const result: U[] = new Array(end - start);
            for (let i = 0; start < end; ++start) {
                result[i++] = predicate(current[start], start, current);
            }
            return result;
        }
        return [];
    }

    public usePattern(expression: string | RegExp, flags?: string) {
        this._matcher = typeof expression === 'string' ? new RegExp(expression, flags ?? 'g') : expression;
    }

    public pattern() {
        return this._matcher.source;
    }

    public reset(input?: string) {
        this.found = 0;
        this._current = null;
        this._matcher.lastIndex = 0;
        if (input) {
            this._input = input;
        }
    }

    get input() {
        return this._input;
    }
}