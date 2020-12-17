"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const object_inspect_1 = __importDefault(require("object-inspect"));
/**
 * Default message formatter.
 *
 * This uses `object-inspect` to print the `data` object.
 *
 * @param data Data object associated with the error.
 * @return String representation of the data object.
 */
function format(data) {
    return object_inspect_1.default(data, { depth: 30 });
}
exports.format = format;
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
exports.Incident = createIncident(Error);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyIsImZpbGUiOiJpbmNpZGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBvYmplY3RJbnNwZWN0IGZyb20gXCJvYmplY3QtaW5zcGVjdFwiO1xuaW1wb3J0IHsgSW5jaWRlbnQgYXMgSW50ZXJmYWNlLCBTdGF0aWNJbmNpZGVudCBhcyBTdGF0aWNJbnRlcmZhY2UgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIERlZmF1bHQgbWVzc2FnZSBmb3JtYXR0ZXIuXG4gKlxuICogVGhpcyB1c2VzIGBvYmplY3QtaW5zcGVjdGAgdG8gcHJpbnQgdGhlIGBkYXRhYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIGRhdGEgRGF0YSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBlcnJvci5cbiAqIEByZXR1cm4gU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChkYXRhOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gb2JqZWN0SW5zcGVjdChkYXRhLCB7ZGVwdGg6IDMwfSk7XG59XG5cbi8qKlxuICogRGVmaW5lIGEgaGlkZGVuIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWVcbiAqIEBwYXJhbSB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZWZpbmVIaWRkZW5Qcm9wZXJ0eShvYmo6IG9iamVjdCwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcGVydHlOYW1lLCB7XG4gICAgdmFsdWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICB9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBub3JtYWwgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9ialxuICogQHBhcmFtIHByb3BlcnR5TmFtZVxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGRlZmluZVNpbXBsZVByb3BlcnR5KG9iajogb2JqZWN0LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wZXJ0eU5hbWUsIHtcbiAgICB2YWx1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgfSk7XG59XG5cbi8qKlxuICogQSBzeW1ib2wgdXNlZCBpbnRlcm5hbGx5IHRvIHByZXZlbnQgdGhlIGNhcHR1cmUgb2YgdGhlIGNhbGwgc3RhY2suXG4gKi9cbmNvbnN0IG5vU3RhY2tTeW1ib2w6IG9iamVjdCA9IHt9O1xuXG4vLyBJbmNpZGVudCBmYWN0b3J5LCBhbGxvd3MgYSBmaW5lIGNvbnRyb2wgb3ZlciB0aGUgZ2V0dGVyIC8gc2V0dGVyc1xuLy8gYW5kIHdpbGwgZXZlbnR1YWxseSBhbGxvdyB0byBoYXZlIFR5cGVFcnJvciwgU3ludGF4RXJyb3IsIGV0Yy4gYXMgc3VwZXIgY2xhc3Nlcy5cbmZ1bmN0aW9uIGNyZWF0ZUluY2lkZW50KF9zdXBlcjogRnVuY3Rpb24pOiBTdGF0aWNJbnRlcmZhY2Uge1xuXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihJbmNpZGVudCwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBfXyh0aGlzOiB0eXBlb2YgX18pOiB2b2lkIHtcbiAgICB0aGlzLmNvbnN0cnVjdG9yID0gSW5jaWRlbnQ7XG4gIH1cblxuICBfXy5wcm90b3R5cGUgPSBfc3VwZXIucHJvdG90eXBlO1xuICBJbmNpZGVudC5wcm90b3R5cGUgPSBuZXcgKF9fIGFzIGFueSkoKTtcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gIGludGVyZmFjZSBQcml2YXRlSW5jaWRlbnQ8RCBleHRlbmRzIG9iamVjdCwgTiBleHRlbmRzIHN0cmluZyA9IHN0cmluZywgQyBleHRlbmRzIChFcnJvciB8IHVuZGVmaW5lZCkgPSAoRXJyb3IgfCB1bmRlZmluZWQpPiBleHRlbmRzIEludGVyZmFjZTxELCBOLCBDPiB7XG4gICAgLyoqXG4gICAgICogYChkYXRhOiBEKSA9PiBzdHJpbmdgOiBBIGxhenkgZm9ybWF0dGVyLCBjYWxsZWQgb25jZSB3aGVuIG5lZWRlZC4gSXRzIHJlc3VsdCByZXBsYWNlcyBgX21lc3NhZ2VgXG4gICAgICogYHN0cmluZ2A6IFRoZSByZXNvbHZlZCBlcnJvciBtZXNzYWdlLlxuICAgICAqL1xuICAgIF9tZXNzYWdlOiBzdHJpbmcgfCAoKGRhdGE6IEQpID0+IHN0cmluZyk7XG5cbiAgICAvKipcbiAgICAgKiBgdW5kZWZpbmVkYDogVGhlIHN0YWNrIGlzIG5vdCByZXNvbHZlZCB5ZXQsIGNsZWFuIHRoZSBzdGFjayB3aGVuIHJlc29sdmluZ1xuICAgICAqIGBudWxsYDogVGhlIHN0YWNrIGlzIG5vdCByZXNvbHZlZCB5ZXQsIGRvIG5vdCBjbGVhbiB0aGUgc3RhY2sgd2hlbiByZXNvbHZpbmdcbiAgICAgKiBgc3RyaW5nYDogVGhlIHN0YWNrIGlzIHJlc29sdmVkIHN0YWNrXG4gICAgICovXG4gICAgX3N0YWNrPzogc3RyaW5nIHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFuIGVycm9yIGNvbnRhaW5pbmcgYW4gdW50b3VjaGVkIHN0YWNrXG4gICAgICovXG4gICAgX3N0YWNrQ29udGFpbmVyPzoge3N0YWNrPzogc3RyaW5nfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEluY2lkZW50PEQgZXh0ZW5kcyBvYmplY3QsIE4gZXh0ZW5kcyBzdHJpbmcsIEMgZXh0ZW5kcyAoRXJyb3IgfCB1bmRlZmluZWQpID0gKEVycm9yIHwgdW5kZWZpbmVkKT4oXG4gICAgdGhpczogUHJpdmF0ZUluY2lkZW50PEQsIE4sIEM+LFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp0cmFpbGluZy1jb21tYVxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICk6IEludGVyZmFjZTxELCBOLCBDPiB8IHZvaWQge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBJbmNpZGVudCkpIHtcbiAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHJldHVybiBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCk7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoYXJnc1swXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnI6IEVycm9yICYgUHJpdmF0ZUluY2lkZW50PEQsIE4sIEM+ID0gYXJnc1swXSBhcyBhbnk7XG4gICAgICAgICAgICBsZXQgY29udmVydGVkOiBQcml2YXRlSW5jaWRlbnQ8RCwgTiwgQz47XG4gICAgICAgICAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSBlcnIubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2U6IHN0cmluZyB8ICgoZGF0YTogRCkgPT4gc3RyaW5nKSA9IHR5cGVvZiBlcnIuX21lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgICA/IGVyci5fbWVzc2FnZVxuICAgICAgICAgICAgICA6IGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgaWYgKGVyci5jYXVzZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyLmRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWQgPSBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgZXJyLmNhdXNlLCBuYW1lLCBlcnIuZGF0YSwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udmVydGVkID0gbmV3IChJbmNpZGVudCBhcyBhbnkpKG5vU3RhY2tTeW1ib2wsIGVyci5jYXVzZSwgbmFtZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyLmRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWQgPSBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgbmFtZSwgZXJyLmRhdGEsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZCA9IG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBuYW1lLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVyci5fc3RhY2tDb250YWluZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBjb252ZXJ0ZWQuX3N0YWNrQ29udGFpbmVyID0gKGFyZ3NbMF0gYXMgYW55KS5fc3RhY2tDb250YWluZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5fc3RhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBjb252ZXJ0ZWQuX3N0YWNrQ29udGFpbmVyID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgY29udmVydGVkLl9zdGFjayA9IG51bGw7IC8vIFVzZSB0aGUgc3RhY2sgYXMtaXNcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnZlcnRlZC5fc3RhY2sgPSBlcnIuX3N0YWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRlZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyAoSW5jaWRlbnQgYXMgYW55KShub1N0YWNrU3ltYm9sLCBhcmdzWzBdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHJldHVybiBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICByZXR1cm4gbmV3IChJbmNpZGVudCBhcyBhbnkpKG5vU3RhY2tTeW1ib2wsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBuZXcgKEluY2lkZW50IGFzIGFueSkobm9TdGFja1N5bWJvbCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG5vU3RhY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBsZXQgbmFtZTogTjtcbiAgICBsZXQgZGF0YTogRCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgY2F1c2U6IEMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG1lc3NhZ2U6IHN0cmluZyB8ICgoZGF0YTogRCkgPT4gc3RyaW5nKTtcblxuICAgIGNvbnN0IGFyZ0NvdW50OiBudW1iZXIgPSBhcmdzLmxlbmd0aDtcbiAgICBsZXQgYXJnSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgICBpZiAoYXJnQ291bnQgPiAwICYmIGFyZ3NbMF0gPT09IG5vU3RhY2tTeW1ib2wpIHtcbiAgICAgIG5vU3RhY2sgPSB0cnVlO1xuICAgICAgYXJnSW5kZXgrKztcbiAgICB9XG4gICAgaWYgKGFyZ0luZGV4IDwgYXJnQ291bnQgJiYgYXJnc1thcmdJbmRleF0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgY2F1c2UgPSBhcmdzW2FyZ0luZGV4KytdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFyZ3NbYXJnSW5kZXhdICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTWlzc2luZyByZXF1aXJlZCBgbmFtZWAgYXJndW1lbnQgdG8gYEluY2lkZW50YC5cIik7XG4gICAgfVxuICAgIG5hbWUgPSBhcmdzW2FyZ0luZGV4KytdO1xuICAgIGlmIChhcmdJbmRleCA8IGFyZ0NvdW50ICYmIHR5cGVvZiBhcmdzW2FyZ0luZGV4XSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZGF0YSA9IGFyZ3NbYXJnSW5kZXgrK107XG4gICAgfVxuICAgIGlmIChhcmdJbmRleCA8IGFyZ0NvdW50ICYmICh0eXBlb2YgYXJnc1thcmdDb3VudCAtIDFdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBhcmdzW2FyZ0NvdW50IC0gMV0gPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgIG1lc3NhZ2UgPSBhcmdzW2FyZ0luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtZXNzYWdlID0gZm9ybWF0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzc2FnZSA9IFwiXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRhdGEgPSB7fSBhcyBEO1xuICAgIH1cblxuICAgIF9zdXBlci5jYWxsKHRoaXMsIHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIgPyBcIjxub24tZXZhbHVhdGVkIGxhenkgbWVzc2FnZT5cIiA6IG1lc3NhZ2UpO1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICBkZWZpbmVIaWRkZW5Qcm9wZXJ0eSh0aGlzLCBcIl9tZXNzYWdlXCIsIG1lc3NhZ2UpO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgaWYgKGNhdXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY2F1c2UgPSBjYXVzZTtcbiAgICB9XG4gICAgZGVmaW5lSGlkZGVuUHJvcGVydHkodGhpcywgXCJfc3RhY2tcIiwgdW5kZWZpbmVkKTtcbiAgICBkZWZpbmVIaWRkZW5Qcm9wZXJ0eSh0aGlzLCBcIl9zdGFja0NvbnRhaW5lclwiLCBub1N0YWNrID8gdW5kZWZpbmVkIDogbmV3IEVycm9yKCkpO1xuICB9XG5cbiAgSW5jaWRlbnQucHJvdG90eXBlLnRvU3RyaW5nID0gRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gIGZ1bmN0aW9uIGdldE1lc3NhZ2UodGhpczogUHJpdmF0ZUluY2lkZW50PG9iamVjdD4pOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLl9tZXNzYWdlID0gdGhpcy5fbWVzc2FnZSh0aGlzLmRhdGEpO1xuICAgIH1cbiAgICBkZWZpbmVTaW1wbGVQcm9wZXJ0eSh0aGlzLCBcIm1lc3NhZ2VcIiwgdGhpcy5fbWVzc2FnZSk7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRNZXNzYWdlPEQgZXh0ZW5kcyBvYmplY3Q+KHRoaXM6IFByaXZhdGVJbmNpZGVudDxEPiwgbWVzc2FnZTogc3RyaW5nIHwgKChkYXRhOiBEKSA9PiBzdHJpbmcpKTogdm9pZCB7XG4gICAgdGhpcy5fbWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdGFjayh0aGlzOiBQcml2YXRlSW5jaWRlbnQ8b2JqZWN0Pik6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX3N0YWNrID09PSB1bmRlZmluZWQgfHwgdGhpcy5fc3RhY2sgPT09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLl9zdGFja0NvbnRhaW5lciAhPT0gdW5kZWZpbmVkICYmIHRoaXMuX3N0YWNrQ29udGFpbmVyLnN0YWNrICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gVGhpcyByZW1vdmVzIHRoZSBmaXJzIGxpbmVzIGNvcnJlc3BvbmRpbmcgdG86IFwiRXJyb3JcXG4gICAgYXQgbmV3IEluY2lkZW50IFsuLi5dXCJcbiAgICAgICAgaWYgKHRoaXMuX3N0YWNrID09PSBudWxsKSB7XG4gICAgICAgICAgLy8gYG51bGxgIGluZGljYXRlcyB0aGF0IHRoZSBzdGFjayBoYXMgdG8gYmUgdXNlZCB3aXRob3V0IGFueSB0cmFuc2Zvcm1hdGlvblxuICAgICAgICAgIC8vIFRoaXMgdXN1YWxseSBvY2N1cnMgd2hlbiB0aGUgc3RhY2sgY29udGFpbmVyIGlzIGFuIGVycm9yIHRoYXQgd2FzIGNvbnZlcnRlZFxuICAgICAgICAgIHRoaXMuX3N0YWNrID0gdGhpcy5fc3RhY2tDb250YWluZXIuc3RhY2s7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3RhY2s6IHN0cmluZyA9IHRoaXMuX3N0YWNrQ29udGFpbmVyLnN0YWNrLnJlcGxhY2UoL15bXlxcbl0rXFxuW15cXG5dK1xcbi8sIFwiXCIpO1xuICAgICAgICAgIHRoaXMuX3N0YWNrID0gdGhpcy5tZXNzYWdlID09PSBcIlwiID9cbiAgICAgICAgICAgIGAke3RoaXMubmFtZX1cXG4ke3N0YWNrfWAgOlxuICAgICAgICAgICAgYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9XFxuJHtzdGFja31gO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zdGFjayA9IHRoaXMubWVzc2FnZSA9PT0gXCJcIiA/IHRoaXMubmFtZSA6IGAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfWA7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jYXVzZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2F1c2Uuc3RhY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zdGFjayA9IGAke3RoaXMuX3N0YWNrfVxcbiAgY2F1c2VkIGJ5ICR7dGhpcy5jYXVzZS5zdGFja31gO1xuICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJzdGFja1wiLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogdGhpcy5fc3RhY2ssXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fc3RhY2s7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRTdGFjayh0aGlzOiBQcml2YXRlSW5jaWRlbnQ8b2JqZWN0Piwgc3RhY2s6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3N0YWNrQ29udGFpbmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3N0YWNrID0gc3RhY2s7XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoSW5jaWRlbnQucHJvdG90eXBlLCBcIm1lc3NhZ2VcIiwge1xuICAgIGdldDogZ2V0TWVzc2FnZSxcbiAgICBzZXQ6IHNldE1lc3NhZ2UsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbmNpZGVudC5wcm90b3R5cGUsIFwic3RhY2tcIiwge1xuICAgIGdldDogZ2V0U3RhY2ssXG4gICAgc2V0OiBzZXRTdGFjayxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgfSk7XG5cbiAgcmV0dXJuIEluY2lkZW50IGFzIGFueTtcbn1cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWVcbmV4cG9ydCBjb25zdCBJbmNpZGVudDogU3RhdGljSW50ZXJmYWNlID0gY3JlYXRlSW5jaWRlbnQoRXJyb3IpO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG5leHBvcnQgaW50ZXJmYWNlIEluY2lkZW50PEQgZXh0ZW5kcyBvYmplY3QsIE4gZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsIEMgZXh0ZW5kcyAoRXJyb3IgfCB1bmRlZmluZWQpID0gKEVycm9yIHwgdW5kZWZpbmVkKT5cbiAgZXh0ZW5kcyBJbnRlcmZhY2U8RCwgTiwgQz4ge1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==
