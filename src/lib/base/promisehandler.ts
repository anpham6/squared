type FunctionError = (error: Error) => void;

const enum PROMISE_STATUS {
    INITIALIZING = 0,
    PENDING,
    THEN_WAITING,
    THEN_COMPLETE,
    CATCH_WAITING,
    CATCH_COMPLETE,
    FINALLY_WAITING,
    FINALLY_COMPLETE
}

export default class PromiseHandler implements squared.lib.base.PromiseHandler {
    public status = 0;

    private _then?: Null<FunctionVoid>;
    private _catch?: Null<FunctionError>;
    private _finally?: FunctionVoid;
    private _error?: Error;

    constructor(public thisArg?: {}) {}

    public then(resolve: Null<FunctionVoid>) {
        this._then = resolve;
        if (this.status === PROMISE_STATUS.THEN_WAITING) {
            this.status = PROMISE_STATUS.PENDING;
            this.success();
        }
        return this;
    }

    public catch(reject: Null<FunctionError>) {
        this._catch = reject;
        if (this.status === PROMISE_STATUS.CATCH_WAITING) {
            this.status = PROMISE_STATUS.PENDING;
            this.throw(this._error);
        }
        return this;
    }

    public finally(complete: FunctionVoid) {
        this._finally = complete;
        switch (this.status) {
            case PROMISE_STATUS.FINALLY_WAITING:
                this.status = PROMISE_STATUS.THEN_COMPLETE;
            case PROMISE_STATUS.THEN_COMPLETE:
            case PROMISE_STATUS.CATCH_COMPLETE:
                this.finalize();
                this.status = PROMISE_STATUS.FINALLY_COMPLETE;
                break;
        }
        return this;
    }

    public success() {
        if (this.complete || this.waiting) {
            return;
        }
        if (this._then === undefined && this.status !== PROMISE_STATUS.PENDING) {
            this.status = PROMISE_STATUS.THEN_WAITING;
        }
        else {
            if (this.hasThen) {
                this._then!!.call(this.thisArg);
            }
            this.status = PROMISE_STATUS.THEN_COMPLETE;
            this.finalize();
        }
    }

    public throw(error?: Error) {
        if (this.complete || this.waiting) {
            return;
        }
        if (this._catch === undefined && this.status !== PROMISE_STATUS.PENDING) {
            this._error = error;
            this.status = PROMISE_STATUS.CATCH_WAITING;
        }
        else {
            if (this.hasCatch) {
                this._catch!!.call(this.thisArg, error);
            }
            this.status = PROMISE_STATUS.CATCH_COMPLETE;
            this.finalize();
        }
    }

    public finalize() {
        switch (this.status) {
            case PROMISE_STATUS.FINALLY_COMPLETE:
                return;
            case PROMISE_STATUS.THEN_COMPLETE:
            case PROMISE_STATUS.CATCH_COMPLETE:
                if (this.hasFinally) {
                    this._finally!!.call(this.thisArg);
                    this.status = PROMISE_STATUS.FINALLY_COMPLETE;
                    break;
                }
                break;
            default:
                this.status = PROMISE_STATUS.FINALLY_WAITING;
                break;
        }
    }

    get hasThen() {
        return typeof this._then === 'function';
    }

    get hasCatch() {
        return typeof this._catch === 'function';
    }

    get hasFinally() {
        return typeof this._finally === 'function';
    }

    get waiting() {
        switch (this.status) {
            case PROMISE_STATUS.THEN_WAITING:
            case PROMISE_STATUS.CATCH_WAITING:
            case PROMISE_STATUS.FINALLY_WAITING:
                return true;
        }
        return false;
    }

    get complete() {
        switch (this.status) {
            case PROMISE_STATUS.THEN_COMPLETE:
            case PROMISE_STATUS.CATCH_COMPLETE:
            case PROMISE_STATUS.FINALLY_COMPLETE:
                return true;
        }
        return false;
    }
}