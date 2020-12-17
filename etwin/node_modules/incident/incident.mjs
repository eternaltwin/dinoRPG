import objectInspect from "object-inspect";
/**
 * Default message formatter.
 *
 * This uses `object-inspect` to print the `data` object.
 *
 * @param data Data object associated with the error.
 * @return String representation of the data object.
 */
export function format(data) {
    return objectInspect(data, { depth: 30 });
}
/**
 * Define a hidden property.
 *
 * @param obj
 * @param propertyName
 * @param value
 */
function defineHiddenProperty(obj, propertyName, value) {
    Object.defineProperty(obj, propertyName, {
        value,
        configurable: true,
        enumerable: false,
        writable: true,
    });
}
/**
 * Define a normal property.
 *
 * @param obj
 * @param propertyName
 * @param value
 */
function defineSimpleProperty(obj, propertyName, value) {
    Object.defineProperty(obj, propertyName, {
        value,
        configurable: true,
        enumerable: true,
        writable: true,
    });
}
/**
 * A symbol used internally to prevent the capture of the call stack.
 */
const noStackSymbol = {};
// Incident factory, allows a fine control over the getter / setters
// and will eventually allow to have TypeError, SyntaxError, etc. as super classes.
function createIncident(_super) {
    Object.setPrototypeOf(Incident, _super);
    function __() {
        this.constructor = Incident;
    }
    __.prototype = _super.prototype;
    Incident.prototype = new __();
    function Incident(
    // tslint:disable-next-line:trailing-comma
    ...args) {
        if (!(this instanceof Incident)) {
            switch (args.length) {
                case 0:
                    return new Incident(noStackSymbol);
                case 1:
                    if (args[0] instanceof Error) {
                        const err = args[0];
                        let converted;
                        const name = err.name;
                        const message = typeof err._message === "function"
                            ? err._message
                            : err.message;
                        if (err.cause instanceof Error) {
                            if (typeof err.data === "object") {
                                converted = new Incident(noStackSymbol, err.cause, name, err.data, message);
                            }
                            else {
                                converted = new Incident(noStackSymbol, err.cause, name, message);
                            }
                        }
                        else {
                            if (typeof err.data === "object") {
                                converted = new Incident(noStackSymbol, name, err.data, message);
                            }
                            else {
                                converted = new Incident(noStackSymbol, name, message);
                            }
                        }
                        if (err._stackContainer !== undefined) {
                            converted._stackContainer = args[0]._stackContainer;
                        }
                        else if (err._stack === undefined) {
                            converted._stackContainer = args[0];
                            converted._stack = null; // Use the stack as-is
                        }
                        else {
                            converted._stack = err._stack;
                        }
                        return converted;
                    }
                    return new Incident(noStackSymbol, args[0]);
                case 2:
                    return new Incident(noStackSymbol, args[0], args[1]);
                case 3:
                    return new Incident(noStackSymbol, args[0], args[1], args[2]);
                default:
                    return new Incident(noStackSymbol, args[0], args[1], args[2], args[3]);
            }
        }
        let noStack = false;
        let name;
        let data = undefined;
        let cause = undefined;
        let message;
        const argCount = args.length;
        let argIndex = 0;
        if (argCount > 0 && args[0] === noStackSymbol) {
            noStack = true;
            argIndex++;
        }
        if (argIndex < argCount && args[argIndex] instanceof Error) {
            cause = args[argIndex++];
        }
        if (typeof args[argIndex] !== "string") {
            throw new TypeError("Missing required `name` argument to `Incident`.");
        }
        name = args[argIndex++];
        if (argIndex < argCount && typeof args[argIndex] === "object") {
            data = args[argIndex++];
        }
        if (argIndex < argCount && (typeof args[argCount - 1] === "string" || typeof args[argCount - 1] === "function")) {
            message = args[argIndex];
        }
        else {
            if (data !== undefined) {
                message = format;
            }
            else {
                message = "";
            }
        }
        if (data === undefined) {
            data = {};
        }
        _super.call(this, typeof message === "function" ? "<non-evaluated lazy message>" : message);
        this.name = name;
        defineHiddenProperty(this, "_message", message);
        this.data = data;
        if (cause !== undefined) {
            this.cause = cause;
        }
        defineHiddenProperty(this, "_stack", undefined);
        defineHiddenProperty(this, "_stackContainer", noStack ? undefined : new Error());
    }
    Incident.prototype.toString = Error.prototype.toString;
    function getMessage() {
        if (typeof this._message === "function") {
            this._message = this._message(this.data);
        }
        defineSimpleProperty(this, "message", this._message);
        return this._message;
    }
    function setMessage(message) {
        this._message = message;
    }
    function getStack() {
        if (this._stack === undefined || this._stack === null) {
            if (this._stackContainer !== undefined && this._stackContainer.stack !== undefined) {
                // This removes the firs lines corresponding to: "Error\n    at new Incident [...]"
                if (this._stack === null) {
                    // `null` indicates that the stack has to be used without any transformation
                    // This usually occurs when the stack container is an error that was converted
                    this._stack = this._stackContainer.stack;
                }
                else {
                    const stack = this._stackContainer.stack.replace(/^[^\n]+\n[^\n]+\n/, "");
                    this._stack = this.message === "" ?
                        `${this.name}\n${stack}` :
                        `${this.name}: ${this.message}\n${stack}`;
                }
            }
            else {
                this._stack = this.message === "" ? this.name : `${this.name}: ${this.message}`;
            }
            if (this.cause !== undefined && this.cause.stack !== undefined) {
                this._stack = `${this._stack}\n  caused by ${this.cause.stack}`;
            }
        }
        Object.defineProperty(this, "stack", {
            configurable: true,
            value: this._stack,
            writable: true,
        });
        return this._stack;
    }
    function setStack(stack) {
        this._stackContainer = undefined;
        this._stack = stack;
    }
    Object.defineProperty(Incident.prototype, "message", {
        get: getMessage,
        set: setMessage,
        enumerable: true,
        configurable: true,
    });
    Object.defineProperty(Incident.prototype, "stack", {
        get: getStack,
        set: setStack,
        enumerable: true,
        configurable: true,
    });
    return Incident;
}
// tslint:disable-next-line:variable-name
export const Incident = createIncident(Error);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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YyxDQUFDLEtBQUssQ0FBQyxDQUFDIiwiZmlsZSI6ImluY2lkZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG9iamVjdEluc3BlY3QgZnJvbSBcIm9iamVjdC1pbnNwZWN0XCI7XG5pbXBvcnQgeyBJbmNpZGVudCBhcyBJbnRlcmZhY2UsIFN0YXRpY0luY2lkZW50IGFzIFN0YXRpY0ludGVyZmFjZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGVmYXVsdCBtZXNzYWdlIGZvcm1hdHRlci5cbiAqXG4gKiBUaGlzIHVzZXMgYG9iamVjdC1pbnNwZWN0YCB0byBwcmludCB0aGUgYGRhdGFgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGVycm9yLlxuICogQHJldHVybiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KGRhdGE6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiBvYmplY3RJbnNwZWN0KGRhdGEsIHtkZXB0aDogMzB9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBoaWRkZW4gcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9ialxuICogQHBhcmFtIHByb3BlcnR5TmFtZVxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGRlZmluZUhpZGRlblByb3BlcnR5KG9iajogb2JqZWN0LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wZXJ0eU5hbWUsIHtcbiAgICB2YWx1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gIH0pO1xufVxuXG4vKipcbiAqIERlZmluZSBhIG5vcm1hbCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcHJvcGVydHlOYW1lXG4gKiBAcGFyYW0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gZGVmaW5lU2ltcGxlUHJvcGVydHkob2JqOiBvYmplY3QsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BlcnR5TmFtZSwge1xuICAgIHZhbHVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICB9KTtcbn1cblxuLyoqXG4gKiBBIHN5bWJvbCB1c2VkIGludGVybmFsbHkgdG8gcHJldmVudCB0aGUgY2FwdHVyZSBvZiB0aGUgY2FsbCBzdGFjay5cbiAqL1xuY29uc3Qgbm9TdGFja1N5bWJvbDogb2JqZWN0ID0ge307XG5cbi8vIEluY2lkZW50IGZhY3RvcnksIGFsbG93cyBhIGZpbmUgY29udHJvbCBvdmVyIHRoZSBnZXR0ZXIgLyBzZXR0ZXJzXG4vLyBhbmQgd2lsbCBldmVudHVhbGx5IGFsbG93IHRvIGhhdmUgVHlwZUVycm9yLCBTeW50YXhFcnJvciwgZXRjLiBhcyBzdXBlciBjbGFzc2VzLlxuZnVuY3Rpb24gY3JlYXRlSW5jaWRlbnQoX3N1cGVyOiBGdW5jdGlvbik6IFN0YXRpY0ludGVyZmFjZSB7XG5cbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKEluY2lkZW50LCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIF9fKHRoaXM6IHR5cGVvZiBfXyk6IHZvaWQge1xuICAgIHRoaXMuY29uc3RydWN0b3IgPSBJbmNpZGVudDtcbiAgfVxuXG4gIF9fLnByb3RvdHlwZSA9IF9zdXBlci5wcm90b3R5cGU7XG4gIEluY2lkZW50LnByb3RvdHlwZSA9IG5ldyAoX18gYXMgYW55KSgpO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgaW50ZXJmYWNlIFByaXZhdGVJbmNpZGVudDxEIGV4dGVuZHMgb2JqZWN0LCBOIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nLCBDIGV4dGVuZHMgKEVycm9yIHwgdW5kZWZpbmVkKSA9IChFcnJvciB8IHVuZGVmaW5lZCk+IGV4dGVuZHMgSW50ZXJmYWNlPEQsIE4sIEM+IHtcbiAgICAvKipcbiAgICAgKiBgKGRhdGE6IEQpID0+IHN0cmluZ2A6IEEgbGF6eSBmb3JtYXR0ZXIsIGNhbGxlZCBvbmNlIHdoZW4gbmVlZGVkLiBJdHMgcmVzdWx0IHJlcGxhY2VzIGBfbWVzc2FnZWBcbiAgICAgKiBgc3RyaW5nYDogVGhlIHJlc29sdmVkIGVycm9yIG1lc3NhZ2UuXG4gICAgICovXG4gICAgX21lc3NhZ2U6IHN0cmluZyB8ICgoZGF0YTogRCkgPT4gc3RyaW5nKTtcblxuICAgIC8qKlxuICAgICAqIGB1bmRlZmluZWRgOiBUaGUgc3RhY2sgaXMgbm90IHJlc29sdmVkIHlldCwgY2xlYW4gdGhlIHN0YWNrIHdoZW4gcmVzb2x2aW5nXG4gICAgICogYG51bGxgOiBUaGUgc3RhY2sgaXMgbm90IHJlc29sdmVkIHlldCwgZG8gbm90IGNsZWFuIHRoZSBzdGFjayB3aGVuIHJlc29sdmluZ1xuICAgICAqIGBzdHJpbmdgOiBUaGUgc3RhY2sgaXMgcmVzb2x2ZWQgc3RhY2tcbiAgICAgKi9cbiAgICBfc3RhY2s/OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQW4gZXJyb3IgY29udGFpbmluZyBhbiB1bnRvdWNoZWQgc3RhY2tcbiAgICAgKi9cbiAgICBfc3RhY2tDb250YWluZXI/OiB7c3RhY2s/OiBzdHJpbmd9O1xuICB9XG5cbiAgZnVuY3Rpb24gSW5jaWRlbnQ8RCBleHRlbmRzIG9iamVjdCwgTiBleHRlbmRzIHN0cmluZywgQyBleHRlbmRzIChFcnJvciB8IHVuZGVmaW5lZCkgPSAoRXJyb3IgfCB1bmRlZmluZWQpPihcbiAgICB0aGlzOiBQcml2YXRlSW5jaWRlbnQ8RCwgTiwgQz4sXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnRyYWlsaW5nLWNvbW1hXG4gICAgLi4uYXJnczogYW55W11cbiAgKTogSW50ZXJmYWNlPEQsIE4sIEM+IHwgdm9pZCB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEluY2lkZW50KSkge1xuICAgICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgcmV0dXJuIG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sKTtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChhcmdzWzBdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycjogRXJyb3IgJiBQcml2YXRlSW5jaWRlbnQ8RCwgTiwgQz4gPSBhcmdzWzBdIGFzIGFueTtcbiAgICAgICAgICAgIGxldCBjb252ZXJ0ZWQ6IFByaXZhdGVJbmNpZGVudDxELCBOLCBDPjtcbiAgICAgICAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IGVyci5uYW1lO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZTogc3RyaW5nIHwgKChkYXRhOiBEKSA9PiBzdHJpbmcpID0gdHlwZW9mIGVyci5fbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAgID8gZXJyLl9tZXNzYWdlXG4gICAgICAgICAgICAgIDogZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICBpZiAoZXJyLmNhdXNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnIuZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZCA9IG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBlcnIuY2F1c2UsIG5hbWUsIGVyci5kYXRhLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWQgPSBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgZXJyLmNhdXNlLCBuYW1lLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnIuZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZCA9IG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBuYW1lLCBlcnIuZGF0YSwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udmVydGVkID0gbmV3IChJbmNpZGVudCBhcyBhbnkpKG5vU3RhY2tTeW1ib2wsIG5hbWUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXJyLl9zdGFja0NvbnRhaW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGNvbnZlcnRlZC5fc3RhY2tDb250YWluZXIgPSAoYXJnc1swXSBhcyBhbnkpLl9zdGFja0NvbnRhaW5lcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyLl9zdGFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGNvbnZlcnRlZC5fc3RhY2tDb250YWluZXIgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICBjb252ZXJ0ZWQuX3N0YWNrID0gbnVsbDsgLy8gVXNlIHRoZSBzdGFjayBhcy1pc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udmVydGVkLl9zdGFjayA9IGVyci5fc3RhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVkO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IChJbmNpZGVudCBhcyBhbnkpKG5vU3RhY2tTeW1ib2wsIGFyZ3NbMF0pO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHJldHVybiBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbm9TdGFjazogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGxldCBuYW1lOiBOO1xuICAgIGxldCBkYXRhOiBEIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGxldCBjYXVzZTogQyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgbWVzc2FnZTogc3RyaW5nIHwgKChkYXRhOiBEKSA9PiBzdHJpbmcpO1xuXG4gICAgY29uc3QgYXJnQ291bnQ6IG51bWJlciA9IGFyZ3MubGVuZ3RoO1xuICAgIGxldCBhcmdJbmRleDogbnVtYmVyID0gMDtcblxuICAgIGlmIChhcmdDb3VudCA+IDAgJiYgYXJnc1swXSA9PT0gbm9TdGFja1N5bWJvbCkge1xuICAgICAgbm9TdGFjayA9IHRydWU7XG4gICAgICBhcmdJbmRleCsrO1xuICAgIH1cbiAgICBpZiAoYXJnSW5kZXggPCBhcmdDb3VudCAmJiBhcmdzW2FyZ0luZGV4XSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjYXVzZSA9IGFyZ3NbYXJnSW5kZXgrK107XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYXJnc1thcmdJbmRleF0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNaXNzaW5nIHJlcXVpcmVkIGBuYW1lYCBhcmd1bWVudCB0byBgSW5jaWRlbnRgLlwiKTtcbiAgICB9XG4gICAgbmFtZSA9IGFyZ3NbYXJnSW5kZXgrK107XG4gICAgaWYgKGFyZ0luZGV4IDwgYXJnQ291bnQgJiYgdHlwZW9mIGFyZ3NbYXJnSW5kZXhdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBkYXRhID0gYXJnc1thcmdJbmRleCsrXTtcbiAgICB9XG4gICAgaWYgKGFyZ0luZGV4IDwgYXJnQ291bnQgJiYgKHR5cGVvZiBhcmdzW2FyZ0NvdW50IC0gMV0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGFyZ3NbYXJnQ291bnQgLSAxXSA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgbWVzc2FnZSA9IGFyZ3NbYXJnSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBmb3JtYXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXNzYWdlID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0YSA9IHt9IGFzIEQ7XG4gICAgfVxuXG4gICAgX3N1cGVyLmNhbGwodGhpcywgdHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIiA/IFwiPG5vbi1ldmFsdWF0ZWQgbGF6eSBtZXNzYWdlPlwiIDogbWVzc2FnZSk7XG5cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIGRlZmluZUhpZGRlblByb3BlcnR5KHRoaXMsIFwiX21lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICBpZiAoY2F1c2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jYXVzZSA9IGNhdXNlO1xuICAgIH1cbiAgICBkZWZpbmVIaWRkZW5Qcm9wZXJ0eSh0aGlzLCBcIl9zdGFja1wiLCB1bmRlZmluZWQpO1xuICAgIGRlZmluZUhpZGRlblByb3BlcnR5KHRoaXMsIFwiX3N0YWNrQ29udGFpbmVyXCIsIG5vU3RhY2sgPyB1bmRlZmluZWQgOiBuZXcgRXJyb3IoKSk7XG4gIH1cblxuICBJbmNpZGVudC5wcm90b3R5cGUudG9TdHJpbmcgPSBFcnJvci5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgZnVuY3Rpb24gZ2V0TWVzc2FnZSh0aGlzOiBQcml2YXRlSW5jaWRlbnQ8b2JqZWN0Pik6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9tZXNzYWdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMuX21lc3NhZ2UgPSB0aGlzLl9tZXNzYWdlKHRoaXMuZGF0YSk7XG4gICAgfVxuICAgIGRlZmluZVNpbXBsZVByb3BlcnR5KHRoaXMsIFwibWVzc2FnZVwiLCB0aGlzLl9tZXNzYWdlKTtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldE1lc3NhZ2U8RCBleHRlbmRzIG9iamVjdD4odGhpczogUHJpdmF0ZUluY2lkZW50PEQ+LCBtZXNzYWdlOiBzdHJpbmcgfCAoKGRhdGE6IEQpID0+IHN0cmluZykpOiB2b2lkIHtcbiAgICB0aGlzLl9tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFN0YWNrKHRoaXM6IFByaXZhdGVJbmNpZGVudDxvYmplY3Q+KTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5fc3RhY2sgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9zdGFjayA9PT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuX3N0YWNrQ29udGFpbmVyICE9PSB1bmRlZmluZWQgJiYgdGhpcy5fc3RhY2tDb250YWluZXIuc3RhY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBUaGlzIHJlbW92ZXMgdGhlIGZpcnMgbGluZXMgY29ycmVzcG9uZGluZyB0bzogXCJFcnJvclxcbiAgICBhdCBuZXcgSW5jaWRlbnQgWy4uLl1cIlxuICAgICAgICBpZiAodGhpcy5fc3RhY2sgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBgbnVsbGAgaW5kaWNhdGVzIHRoYXQgdGhlIHN0YWNrIGhhcyB0byBiZSB1c2VkIHdpdGhvdXQgYW55IHRyYW5zZm9ybWF0aW9uXG4gICAgICAgICAgLy8gVGhpcyB1c3VhbGx5IG9jY3VycyB3aGVuIHRoZSBzdGFjayBjb250YWluZXIgaXMgYW4gZXJyb3IgdGhhdCB3YXMgY29udmVydGVkXG4gICAgICAgICAgdGhpcy5fc3RhY2sgPSB0aGlzLl9zdGFja0NvbnRhaW5lci5zdGFjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdGFjazogc3RyaW5nID0gdGhpcy5fc3RhY2tDb250YWluZXIuc3RhY2sucmVwbGFjZSgvXlteXFxuXStcXG5bXlxcbl0rXFxuLywgXCJcIik7XG4gICAgICAgICAgdGhpcy5fc3RhY2sgPSB0aGlzLm1lc3NhZ2UgPT09IFwiXCIgP1xuICAgICAgICAgICAgYCR7dGhpcy5uYW1lfVxcbiR7c3RhY2t9YCA6XG4gICAgICAgICAgICBgJHt0aGlzLm5hbWV9OiAke3RoaXMubWVzc2FnZX1cXG4ke3N0YWNrfWA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3N0YWNrID0gdGhpcy5tZXNzYWdlID09PSBcIlwiID8gdGhpcy5uYW1lIDogYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9YDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNhdXNlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jYXVzZS5zdGFjayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3N0YWNrID0gYCR7dGhpcy5fc3RhY2t9XFxuICBjYXVzZWQgYnkgJHt0aGlzLmNhdXNlLnN0YWNrfWA7XG4gICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInN0YWNrXCIsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLl9zdGFjayxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9zdGFjaztcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFN0YWNrKHRoaXM6IFByaXZhdGVJbmNpZGVudDxvYmplY3Q+LCBzdGFjazogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhY2tDb250YWluZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3RhY2sgPSBzdGFjaztcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbmNpZGVudC5wcm90b3R5cGUsIFwibWVzc2FnZVwiLCB7XG4gICAgZ2V0OiBnZXRNZXNzYWdlLFxuICAgIHNldDogc2V0TWVzc2FnZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEluY2lkZW50LnByb3RvdHlwZSwgXCJzdGFja1wiLCB7XG4gICAgZ2V0OiBnZXRTdGFjayxcbiAgICBzZXQ6IHNldFN0YWNrLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICB9KTtcblxuICByZXR1cm4gSW5jaWRlbnQgYXMgYW55O1xufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZVxuZXhwb3J0IGNvbnN0IEluY2lkZW50OiBTdGF0aWNJbnRlcmZhY2UgPSBjcmVhdGVJbmNpZGVudChFcnJvcik7XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbmV4cG9ydCBpbnRlcmZhY2UgSW5jaWRlbnQ8RCBleHRlbmRzIG9iamVjdCwgTiBleHRlbmRzIHN0cmluZyA9IHN0cmluZywgQyBleHRlbmRzIChFcnJvciB8IHVuZGVmaW5lZCkgPSAoRXJyb3IgfCB1bmRlZmluZWQpPlxuICBleHRlbmRzIEludGVyZmFjZTxELCBOLCBDPiB7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9
