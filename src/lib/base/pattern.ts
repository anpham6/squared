export default class Pattern implements squared.lib.base.Pattern {
    public found = 0;

    private _input = '';
    private _matcher!: RegExp;
    private _matchResult: Null<RegExpExecArray> = null;

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
        if (this._input) {
            if (start !== undefined) {
                if (start < 0) {
                    return false;
                }
                this.reset();
                while (this._matchResult = this._matcher.exec(this._input)) {
                    ++this.found;
                    if (start-- === 0) {
                        return true;
                    }
                }
            }
            else {
                this._matchResult = this._matcher.exec(this._input);
                if (this._matchResult) {
                    ++this.found;
                    return true;
                }
            }
        }
        return false;
    }

    public lookingAt() {
        return this.find(0) && this._matchResult!.index === 0;
    }

    public matches() {
        return this.find(0) && this._matchResult![0].length === this._input.length;
    }

    public start(index = 0) {
        const matchResult = this._matchResult;
        if (matchResult && index >= 0) {
            let pos = matchResult.index,
                i = 0;
            while (index) {
                if (matchResult[i]) {
                    pos += matchResult[i++].length;
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
        const matchResult = this._matchResult;
        if (matchResult && index >= 0) {
            let pos = matchResult.index + matchResult[0].length,
                i = 1;
            while (index) {
                if (matchResult[i]) {
                    pos += matchResult[i++].length;
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
        if (this._matchResult) {
            return typeof index === 'number' ? this._matchResult[index] : this._matchResult.groups?.[index];
        }
    }

    public groups(start = 0, end?: number) {
        if (this._matchResult) {
            if (end !== undefined) {
                ++end;
            }
            else if (start === 0) {
                return this._matchResult;
            }
            return this._matchResult.slice(start, end);
        }
        return [];
    }

    public groupCount() {
        return this._matchResult ? this._matchResult.length : 0;
    }

    public map<T>(predicate: IteratorPredicate<string, T>, start = 0, end?: number): T[] {
        const matchResult = this._matchResult;
        if (matchResult) {
            if (end === undefined) {
                end = matchResult.length;
            }
            const result: T[] = new Array(end - start);
            for (let i = 0; start < end; ++start) {
                result[i++] = predicate(matchResult[start], start, matchResult);
            }
            return result;
        }
        return [];
    }

    public replaceAll(replacement: string | PatternGroupPredicate, replaceCount = Infinity) {
        const stringAs = typeof replacement === 'string';
        const input = this._input;
        let index = this._matcher.lastIndex,
            output = index ? input.substring(0, index) : '';
        while (replaceCount && this.find()) {
            const matchResult = this._matchResult!;
            output += input.substring(index, matchResult.index) + (stringAs ? replacement as string : (replacement as PatternGroupPredicate)(matchResult, matchResult[0]));
            index = matchResult.index + matchResult[0].length;
            --replaceCount;
        }
        return output + input.substring(index);
    }

    public replaceFirst(replacement: string | PatternGroupPredicate) {
        return this.replaceAll(replacement, 1);
    }

    public usePattern(expression: string | RegExp, flags?: string) {
        this._matcher = typeof expression === 'string' ? new RegExp(expression, flags ?? 'g') : expression;
    }

    public pattern() {
        return this._matcher.source;
    }

    public toMatchResult() {
        return this._matchResult;
    }

    public reset(input?: string) {
        this.found = 0;
        this._matchResult = null;
        this._matcher.lastIndex = 0;
        if (input) {
            this._input = input;
        }
    }
}