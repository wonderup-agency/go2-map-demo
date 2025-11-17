/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Represents a relative value (percent).
 *
 * The Percent object, can be instantiated using two ways:
 *
 * * Via `new Percent(X)`.
 * * Via `am5.percent(X)`.
 *
 * You can also use shortcut functions for `0%`, `50%`, and `100%`:
 * * `am5.p0`
 * * `am5.p50`
 * * `am5.p100`
 */
class Percent {
    /**
     * Constructor.
     *
     * @param percent  Percent value
     */
    constructor(percent) {
        /**
         * Value in percent.
         */
        Object.defineProperty(this, "_value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._value = percent;
    }
    /**
     * Relative value.
     *
     * E.g. 100% is 1, 50% is 0.5, etc.
     *
     * This is useful to apply transformations to other values. E.g.:
     *
     * ```TypeScript
     * let value = 256;
     * let percent = new am5.p50;
     * console.log(value * percent.value); // outputs 128
     * ```
     * ```JavaScript
     * var value = 256;
     * var percent = new am5.p50;
     * console.log(value * percent.value); // outputs 128
     * ```
     *
     * Alternatively, you can use `am5.percent()` helper function:
     *
     * ```TypeScript
     * let value = 256;
     * let percent = am5.p50;
     * console.log(value * percent.value); // outputs 128
     * ```
     * ```JavaScript
     * var value = 256;
     * var percent = am5.p50;
     * console.log(value * percent.value); // outputs 128
     * ```
     *
     * @readonly
     * @return Relative value
     */
    get value() {
        return this._value / 100;
    }
    /**
     * Value in percent.
     *
     * @readonly
     * @return Percent
     */
    get percent() {
        return this._value;
    }
    toString() {
        return "" + this._value + "%";
    }
    interpolate(min, max) {
        return min + (this.value * (max - min));
    }
    static normalize(percent, min, max) {
        if (percent instanceof Percent) {
            return percent;
        }
        else {
            if (min === max) {
                return new Percent(0);
            }
            else {
                return new Percent(Math.min(Math.max((percent - min) * (1 / (max - min)), 0), 1) * 100);
            }
        }
    }
}
/**
 * Converts numeric percent value to a proper [[Percent]] object.
 *
 * ```TypeScript
 * pieSeries.set("radius", am5.percent(80));
 * ```
 * ```JavaScript
 * pieSeries.set("radius", am5.percent(80));
 * ```
 *
 * @param value  Percent
 * @return Percent object
 */
function percent(value) {
    return new Percent(value);
}
/**
 * A shortcut function to `am5.percent(0)`.
 */
percent(0);
/**
 * A shortcut function to `am5.percent(100)`.
 */
const p100 = percent(100);
/**
 * A shortcut function to `am5.percent(50)`.
 */
const p50 = percent(50);
/**
 * Checks if value is a [[Percent]] object.
 *
 * @ignore Exclude from docs
 * @param value  Input value
 * @return Is percent?
 */
function isPercent(value) {
    return value instanceof Percent;
}

/**
 * A collection of utility functions for various type checks and conversion
 * @hidden
 */
/**
 * ============================================================================
 * TYPE CHECK
 * ============================================================================
 * @hidden
 */
/**
 * Returns `true` if value is not a number (NaN).
 *
 * @param value Input value
 * @return Is NaN?
 */
function isNaN$1(value) {
    return Number(value) !== value;
}
/**
 * Returns a type of the value.
 *
 * @param value  Input value
 * @return Type of the value
 * @ignore
 */
function getType(value) {
    return ({}).toString.call(value);
}
/**
 * ============================================================================
 * QUICK CONVERSION
 * ============================================================================
 * @hidden
 */
/**
 * Converts any value into a `number`.
 *
 * @param value  Source value
 * @return Number representation of value
 */
function toNumber(value) {
    if (value != null && !isNumber(value)) {
        let converted = Number(value);
        if (isNaN$1(converted) && isString(value) && value != "" && value.match(/[0-9]+/)) {
            const newValue = value.replace(/[^0-9.\-]+/g, '');
            return value === newValue ? converted : toNumber(newValue);
        }
        return converted;
    }
    return value;
}
/**
 * Converts anything to Date object.
 *
 * @param value  A value of any type
 * @return Date object representing a value
 */
function toDate(value) {
    if (isDate(value)) {
        // TODO maybe don't create a new Date ?
        return new Date(value);
    }
    else if (isNumber(value)) {
        return new Date(value);
    }
    else {
        // Try converting to number (assuming timestamp)
        let num = Number(value);
        if (!isNumber(num)) {
            return new Date(value);
        }
        else {
            return new Date(num);
        }
    }
}
/**
 * Converts numeric value into string. Deals with large or small numbers that
 * would otherwise use exponents.
 *
 * @param value  Numeric value
 * @return Numeric value as string
 */
function numberToString(value) {
    // TODO handle Infinity and -Infinity
    if (isNaN$1(value)) {
        return "NaN";
    }
    if (value === Infinity) {
        return "Infinity";
    }
    if (value === -Infinity) {
        return "-Infinity";
    }
    // Negative 0
    if ((value === 0) && (1 / value === -Infinity)) {
        return "-0";
    }
    // Preserve negative and deal with absoute values
    let negative = value < 0;
    value = Math.abs(value);
    // TODO test this
    let parsed = /^([0-9]+)(?:\.([0-9]+))?(?:e[\+\-]([0-9]+))?$/.exec("" + value);
    let digits = parsed[1];
    let decimals = parsed[2] || "";
    let res;
    // Leave the nummber as it is if it does not use exponents
    if (parsed[3] === undefined) {
        res = (decimals === "" ? digits : digits + "." + decimals);
    }
    else {
        let exponent = +parsed[3];
        // Deal with decimals
        if (value < 1) {
            let zeros = exponent - 1;
            res = "0." + repeat("0", zeros) + digits + decimals;
            // Deal with integers
        }
        else {
            let zeros = exponent - decimals.length;
            if (zeros === 0) {
                res = digits + decimals;
            }
            else if (zeros < 0) {
                res = digits + decimals.slice(0, zeros) + "." + decimals.slice(zeros);
            }
            else {
                res = digits + decimals + repeat("0", zeros);
            }
        }
    }
    return negative ? "-" + res : res;
}
/**
 * Repeats a `string` number of times as set in `amount`.
 *
 * @ignore Exclude from docs
 * @todo Make this faster
 * @param string  Source string
 * @param amount  Number of times to repeat string
 * @return New string
 */
function repeat(string, amount) {
    return new Array(amount + 1).join(string);
}
/**
 * ============================================================================
 * TYPE CHECK
 * ============================================================================
 * @hidden
 */
/**
 * Checks if parameter is `Date`.
 *
 * @param value  Input value
 * @return Is Date?
 */
function isDate(value) {
    return getType(value) === "[object Date]";
}
/**
 * Checks if parameter is `string`.
 *
 * @param value  Input value
 * @return Is string?
 */
function isString(value) {
    return typeof value === "string";
}
/**
 * Checks if parameter is `number`.
 *
 * @param value  Input value
 * @return Is number?
 */
function isNumber(value) {
    return typeof value === "number" && Number(value) == value;
}
/**
 * Checks if parameter is `object`.
 *
 * @param value  Input value
 * @return Is object?
 */
function isObject(value) {
    return typeof value === "object" && value !== null;
}
/**
 * ============================================================================
 * STATIC CONSTANTS
 * ============================================================================
 * @hidden
 */
/**
 * @ignore Exclude from docs
 */
const PLACEHOLDER = "__§§§__";
/**
 * @ignore Exclude from docs
 */
const PLACEHOLDER2 = "__§§§§__";

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 * @hidden
 */
/**
 * Searches `array` for `value`.
 *
 * Returns -1 if not found.
 *
 * @param array  Source array
 * @param value  Value to search
 * @returns Index
 */
function indexOf(array, value) {
    const length = array.length;
    for (let i = 0; i < length; ++i) {
        // TODO handle NaN
        if (array[i] === value) {
            return i;
        }
    }
    return -1;
}
/**
 * Calls `test` for each element in `array`.
 *
 * If `test` returns `true` then it immediately returns `true`.
 *
 * If `test` returns `false` for all of the elements in `array` then it returns `false`.
 *
 * @param array  Source array
 * @param test   Function which is called on each element
 * @returns Whether `test` returned true or not
 */
function any(array, test) {
    const length = array.length;
    for (let i = 0; i < length; ++i) {
        if (test(array[i])) {
            return true;
        }
    }
    return false;
}
/**
 * Calls `fn` function for every member of array and returns a new array out
 * of all outputs.
 *
 * @param array  Source array
 * @param fn     Callback function
 * @returns New array
 */
function map(array, fn) {
    const length = array.length;
    const output = new Array(length);
    for (let i = 0; i < length; ++i) {
        output[i] = fn(array[i], i);
    }
    return output;
}
/**
 * Iterates through all items in array and calls `fn` function for each of
 * them.
 *
 * @param array  Source array
 * @param fn     Callback function
 */
function each$1(array, fn) {
    const length = array.length;
    for (let i = 0; i < length; ++i) {
        fn(array[i], i);
    }
}
/**
 * Iterates through all items in array in reverse order and calls `fn` function for each of
 * them.
 *
 * @param array  Source array
 * @param fn     Callback function
 */
function eachReverse(array, fn) {
    let i = array.length;
    while (i > 0) {
        --i;
        fn(array[i], i);
    }
}
/**
 * Iterates through all items in array and calls `fn` function for each of
 * them.
 *
 * If `fn` call evaluates to `false`, further iteration is cancelled.
 *
 * @param array  Source array
 * @param fn     Callback function
 */
function eachContinue$1(array, fn) {
    const length = array.length;
    for (let i = 0; i < length; ++i) {
        if (!fn(array[i], i)) {
            break;
        }
    }
}
/**
 * Removes `element` from `array`.
 *
 * If there are multiple copies of `element`, they are all removed.
 *
 * @param array    Source array
 * @param element  Item to remove
 */
function remove(array, element) {
    let found = false;
    let index = 0;
    for (;;) {
        index = array.indexOf(element, index);
        if (index === -1) {
            return found;
        }
        else {
            found = true;
            array.splice(index, 1);
        }
    }
}
function removeFirst(array, element) {
    let index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
        return true;
    }
    else {
        return false;
    }
}
/**
 * Adds an `element` to `array`.
 *
 * If array already contains and item like this, it is removed before adding
 * it again.
 *
 * Optionally `toIndex` can be specified to add element at specific index.
 *
 * @param array    Source array
 * @param element  Item to add
 * @param array    Index to move item to
 */
function move(array, element, toIndex) {
    // @todo this implementation must be the same as the List.moveValue method
    // @todo don't do anything if the desired index is the same as the current index
    let index = indexOf(array, element);
    // @todo remove all old values rather than only the first ?
    if (index !== -1) {
        removeIndex(array, index);
    }
    {
        array.push(element);
    }
}
/**
 * Pushes `element` into `array` if it doesn't already exist.
 *
 * @param array    Source array
 * @param element  Item to add
 */
function pushOne(array, element) {
    if (array.indexOf(element) === -1) {
        array.push(element);
    }
}
/**
 * Returns a shallow copy of `array`.
 *
 * @param array  Source array
 * @returns Copy of the array
 */
function copy$1(array) {
    const length = array.length;
    // It's faster to create the array with a pre-defined length
    const output = new Array(length);
    for (let i = 0; i < length; ++i) {
        // Because the array has a pre-defined length, we have to assign rather than push
        // This is also faster than pushing
        output[i] = array[i];
    }
    return output;
}
/**
 * Inserts a value into array at specific index.
 *
 * @param array  Source array
 * @param index  Index
 * @param value  Value to insert
 */
function insertIndex(array, index, value) {
    array.splice(index, 0, value);
}
/**
 * Removes a value from array at specific index.
 *
 * @param array  Source array
 * @param index  Index
 */
function removeIndex(array, index) {
    array.splice(index, 1);
}
/**
 * Searches the array using custom function and returns index of the item if
 * found.
 *
 * Will call `matches` function on all items of the array. If return value
 * evaluates to `true`, index is returned.
 *
 * Otherwise returns -1.
 *
 * @param array    Source array
 * @param matches  Search function
 * @returns Index of the item if found
 */
function findIndex(array, matches) {
    const length = array.length;
    for (let i = 0; i < length; ++i) {
        if (matches(array[i], i)) {
            return i;
        }
    }
    return -1;
}
/**
 * This is the same as `findIndex` except it searches from right to left.
 *
 * @param array    Source array
 * @param matches  Search function
 * @returns Index of the item if found
 */
function findIndexReverse(array, matches) {
    let i = array.length;
    while (i > 0) {
        --i;
        if (matches(array[i], i)) {
            return i;
        }
    }
    return -1;
}
/**
 * Searches the array using custom function and returns item if found.
 *
 * Will call `matches` function on all items of the array. If return value
 * evaluates to `true`, index is returned.
 *
 * Otherwise returns `undefined`.
 *
 * @param array    Source array
 * @param matches  Search function
 * @returns Item if found
 */
function find(array, matches) {
    const index = findIndex(array, matches);
    if (index !== -1) {
        return array[index];
    }
}
/**
 * This is the same as `find` except it searches from right to left.
 *
 * @param array    Source array
 * @param matches  Search function
 * @returns Item if found
 */
function findReverse(array, matches) {
    const index = findIndexReverse(array, matches);
    if (index !== -1) {
        return array[index];
    }
}
/**
 * Orders an array using specific `ordering` function and returns right-most index of
 * the `value`.
 *
 * @ignore Exclude from docs
 * @param array     Source array
 * @param ordering  An ordering function
 * @returns Result of the search
 */
function getSortedIndex(array, ordering) {
    let start = 0;
    let end = array.length;
    let found = false;
    while (start < end) {
        // TODO is this faster/slower than using Math.floor ?
        const pivot = (start + end) >> 1;
        const order = ordering(array[pivot]);
        // less
        if (order < 0) {
            start = pivot + 1;
            // equal
        }
        else if (order === 0) {
            found = true;
            start = pivot + 1;
            // more
        }
        else {
            end = pivot;
        }
    }
    return {
        found: found,
        index: (found ? start - 1 : start)
    };
}
/**
 * Orders an array using specific `ordering` function and returns left-most index of
 * the `value`.
 *
 * @ignore Exclude from docs
 * @param array     Source array
 * @param ordering  An ordering function
 * @returns Result of the search
 */
function getFirstSortedIndex(array, ordering) {
    let start = 0;
    let end = array.length;
    let found = false;
    while (start < end) {
        // TODO is this faster/slower than using Math.floor ?
        const pivot = (start + end) >> 1;
        const order = ordering(array[pivot]);
        // less
        if (order < 0) {
            start = pivot + 1;
            // equal
        }
        else if (order === 0) {
            found = true;
            end = pivot;
            // more
        }
        else {
            end = pivot;
        }
    }
    return {
        found: found,
        index: start
    };
}
function keepIf(array, keep) {
    let i = array.length;
    while (i > 0) {
        --i;
        if (!keep(array[i])) {
            array.splice(i, 1);
        }
    }
}

function keys(object) {
    return Object.keys(object);
}
/**
 * Returns an array of object's property names ordered using specific ordering
 * function.
 *
 * @param object  Source object
 * @param order   Ordering function
 * @returns Object property names
 */
function keysOrdered(object, order) {
    return keys(object).sort(order);
}
function copy(object) {
    return Object.assign({}, object);
}
function each(object, f) {
    keys(object).forEach((key) => {
        f(key, object[key]);
    });
}
/**
 * Iterates through all properties of the object calling `fn` for each of them.
 *
 * If return value of the function evaluates to `false` further iteration is
 * cancelled.
 *
 * @param object  Source object
 * @param fn      Callback function
 */
function eachContinue(object, fn) {
    for (let key in object) {
        if (hasKey(object, key)) {
            if (!fn(key, object[key])) {
                break;
            }
        }
    }
}
/**
 * Checks if `object` has a specific `key`.
 *
 * @param object  Source object
 * @param key     Property name
 * @returns Has key?
 */
function hasKey(object, key) {
    return {}.hasOwnProperty.call(object, key);
}

/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
/**
 * A base class for disposable objects.
 *
 * @ignore Exclude from docs
 */
class DisposerClass {
    /**
     * Constructor.
     */
    constructor() {
        /**
         * Is object disposed?
         */
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._disposed = false;
    }
    /**
     * Checks if object is disposed.
     *
     * @return Disposed?
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Disposes the object.
     */
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._dispose();
        }
    }
}
/**
 * A class for creating an IDisposer.
 *
 * @ignore Exclude from docs
 */
class Disposer {
    /**
     * Constructor.
     *
     * @param dispose  Function that disposes object
     */
    constructor(dispose) {
        /**
         * Is object disposed?
         */
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Method that disposes the object.
         */
        Object.defineProperty(this, "_dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._disposed = false;
        this._dispose = dispose;
    }
    /**
     * Checks if object is disposed.
     *
     * @return Disposed?
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Disposes the object.
     */
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._dispose();
        }
    }
}
/**
 * This can be extended by other classes to add a `_disposers` property.
 *
 * @ignore Exclude from docs
 */
class ArrayDisposer extends DisposerClass {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    _dispose() {
        each$1(this._disposers, (x) => {
            x.dispose();
        });
    }
}
/**
 * A collection of related disposers that can be disposed in one go.
 *
 * @ignore Exclude from docs
 */
class MultiDisposer extends DisposerClass {
    constructor(disposers) {
        super();
        Object.defineProperty(this, "_disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._disposers = disposers;
    }
    _dispose() {
        each$1(this._disposers, (x) => {
            x.dispose();
        });
    }
    get disposers() {
        return this._disposers;
    }
}
/**
 * @ignore Exclude from docs
 * @todo Description
 */
class CounterDisposer extends Disposer {
    constructor() {
        super(...arguments);
        /**
         * [_counter description]
         *
         * @todo Description
         */
        Object.defineProperty(this, "_counter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * [increment description]
     *
     * @todo Description
     */
    increment() {
        // TODO throw an error if it is disposed
        ++this._counter;
        // TODO make this more efficient
        return new Disposer(() => {
            --this._counter;
            if (this._counter === 0) {
                this.dispose();
            }
        });
    }
}

/**
 * ============================================================================
 * DOM FUNCTIONS
 * ============================================================================
 * @hidden
 */
/**
 * Execute a function when DOM is ready.
 *
 * @since 5.0.2
 * @param  f  Callback
 */
function ready(f) {
    if (document.readyState !== "loading") {
        f();
    }
    else {
        const listener = () => {
            if (document.readyState !== "loading") {
                document.removeEventListener("readystatechange", listener);
                f();
            }
        };
        document.addEventListener("readystatechange", listener);
    }
}
/**
 * Removes a DOM element.
 * @param  el  Target element
 */
function removeElement(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
/**
 * Function that adds a disposable event listener directly to a DOM element.
 *
 * @ignore Exclude from docs
 * @param dom       A DOM element to add event to
 * @param type      Event type
 * @param listener  Event listener
 * @returns Disposable event
 */
function addEventListener(dom, type, listener, options) {
    //@todo proper type check for options: EventListenerOptions | boolean (TS for some reason gives error on passive parameter)
    dom.addEventListener(type, listener, options || false);
    return new Disposer(() => {
        dom.removeEventListener(type, listener, options || false);
    });
}
/**
 * Function that adds an event listener which is triggered when the browser's zoom changes.
 *
 * @param listener  Event listener
 * @returns Disposable event
 */
function onZoom(listener) {
    // TODO use matchMedia instead ?
    return addEventListener(window, "resize", (_ev) => {
        listener();
    });
}
/**
 * @ignore
 */
function supports(cap) {
    switch (cap) {
        case "touchevents":
            //return "ontouchstart" in document.documentElement;
            return window.hasOwnProperty("TouchEvent");
        case "pointerevents":
            return window.hasOwnProperty("PointerEvent");
        case "mouseevents":
            return window.hasOwnProperty("MouseEvent");
        case "wheelevents":
            return window.hasOwnProperty("WheelEvent");
        case "keyboardevents":
            return window.hasOwnProperty("KeyboardEvent");
    }
    return false;
}
/**
 * @ignore
 */
function getPointerId(event) {
    let id = event.pointerId || 0;
    return id;
}
/**
 * Removes focus from any element by shifting focus to body.
 *
 * @ignore
 */
function blur() {
    if (document.activeElement && document.activeElement != document.body) {
        if (document.activeElement.blur) {
            document.activeElement.blur();
        }
        else {
            let input = document.createElement("button");
            input.style.position = "fixed";
            input.style.top = "0px";
            input.style.left = "-10000px";
            document.body.appendChild(input);
            input.focus();
            input.blur();
            document.body.removeChild(input);
        }
    }
}
/**
 * Focuses element.
 *
 * @ignore
 */
function focus(el) {
    if (el) {
        el.focus();
    }
}
/**
 * @ignore
 */
function getRendererEvent(key) {
    if (supports("pointerevents")) {
        return key;
    }
    else if (supports("touchevents")) {
        switch (key) {
            case "pointerover": return "touchstart";
            case "pointerout": return "touchend";
            case "pointerleave": return "touchend";
            case "pointerdown": return "touchstart";
            case "pointermove": return "touchmove";
            case "pointerup": return "touchend";
            case "click": return "click";
            case "dblclick": return "dblclick";
        }
    }
    else if (supports("mouseevents")) {
        switch (key) {
            case "pointerover": return "mouseover";
            case "pointerout": return "mouseout";
            case "pointerleave": return "mouseleave";
            case "pointerdown": return "mousedown";
            case "pointermove": return "mousemove";
            case "pointerup": return "mouseup";
            case "click": return "click";
            case "dblclick": return "dblclick";
        }
    }
    return key;
}
/**
 * Determines if pointer event originated from a touch pointer or mouse.
 *
 * @param ev  Original event
 * @return Touch pointer?
 */
function isTouchEvent(ev) {
    if (typeof Touch !== "undefined" && ev instanceof Touch) {
        return true;
    }
    else if (typeof PointerEvent !== "undefined" && ev instanceof PointerEvent && ev.pointerType != null) {
        switch (ev.pointerType) {
            case "touch":
            case "pen":
            case 2:
                return true;
            case "mouse":
            case 4:
                return false;
            default:
                return !(ev instanceof MouseEvent);
        }
    }
    else if (ev.type != null) {
        if (ev.type.match(/^mouse/)) {
            return false;
        }
    }
    return true;
}
/**
 * Sets style property on DOM element.
 *
 * @ignore Exclude from docs
 */
function setStyle(dom, property, value) {
    dom.style[property] = value;
}
function getStyle(dom, property) {
    return dom.style[property];
}
/**
 * Gets the target of the event, works for shadow DOM too.
 */
function getEventTarget(event) {
    if (event.composedPath) {
        const path = event.composedPath();
        if (path.length === 0) {
            return null;
        }
        else {
            return path[0];
        }
    }
    else {
        return event.target;
    }
}
/**
 * Checks of element `a` contains element `b`.
 *
 * @param a  Aleged ascendant
 * @param b  Aleged descendant
 * @return Contains?
 */
function contains(a, b) {
    let cursor = b;
    while (true) {
        if (a === cursor) {
            return true;
        }
        else if (cursor.parentNode === null) {
            // TODO better ShadowRoot detection
            if (cursor.host == null) {
                return false;
            }
            else {
                cursor = cursor.host;
            }
        }
        else {
            cursor = cursor.parentNode;
        }
    }
}
/**
 * Returns `true` if pointer event originated on an element within Root.
 *
 * @since 5.2.8
 * @param  event   Event
 * @param  target  Target element
 */
function isLocalEvent(event, target) {
    return event.target && contains(target.root.dom, event.target);
}
/**
 * Disables or enables interactivity of a DOM element.
 *
 * @param  target       Target element
 * @param  interactive  Interactive?
 */
function setInteractive(target, interactive) {
    if (interactive) {
        target.style.pointerEvents = "auto";
    }
    else {
        target.style.pointerEvents = "none";
    }
}
function getEventKey(event) {
    if (event.key !== undefined) {
        return event.key;
    }
    switch (event.keyCode) {
        case 9: return "Tab";
        case 13: return "Enter";
        case 16: return "Shift";
        case 17: return "Control";
        case 27: return "Escape";
        case 32: return " ";
        case 37: return "ArrowLeft";
        case 38: return "ArrowUp";
        case 39: return "ArrowRight";
        case 40: return "ArrowDown";
        case 46: return "Delete";
    }
    return "" + event.keyCode;
}
// /**
//  * Applies a set of styles to an element. Stores the original styles so they
//  * can be restored later.
//  *
//  * @ignore
//  * @param io      Element
//   */
// export function prepElementForDrag(dom: HTMLElement): void {
// 	// @todo: save current values
// 	// Define possible props
// 	let props = [
// 		"touchAction", "webkitTouchAction", "MozTouchAction", "MSTouchAction", "msTouchAction", "oTouchAction",
// 		"userSelect", "webkitUserSelect", "MozUserSelect", "MSUserSelect", "msUserSelect", "oUserSelect",
// 		"touchSelect", "webkitTouchSelect", "MozTouchSelect", "MSTouchSelect", "msTouchSelect", "oTouchSelect",
// 		"touchCallout", "webkitTouchCallout", "MozTouchCallout", "MSTouchCallout", "msTouchCallout", "oTouchCallout",
// 		"contentZooming", "webkitContentZooming", "MozContentZooming", "MSContentZooming", "msContentZooming", "oContentZooming",
// 		"userDrag", "webkitUserDrag", "MozUserDrag", "MSUserDrag", "msUserDrag", "oUserDrag"
// 	];
// 	for (let i = 0; i < props.length; i++) {
// 		if (props[i] in dom.style) {
// 			setStyle(dom, props[i], "none");
// 		}
// 	}
// 	// Remove iOS-specific selection;
// 	setStyle(dom, "tapHighlightColor", "rgba(0, 0, 0, 0)");
// }
// /**
//  * Restores replaced styles
//  *
//  * @ignore
//  * @param  io  Element
//  */
// export function unprepElementForDrag(dom: HTMLElement): void {
// 	// Define possible props
// 	let props = [
// 		"touchAction", "webkitTouchAction", "MozTouchAction", "MSTouchAction", "msTouchAction", "oTouchAction",
// 		"userSelect", "webkitUserSelect", "MozUserSelect", "MSUserSelect", "msUserSelect", "oUserSelect",
// 		"touchSelect", "webkitTouchSelect", "MozTouchSelect", "MSTouchSelect", "msTouchSelect", "oTouchSelect",
// 		"touchCallout", "webkitTouchCallout", "MozTouchCallout", "MSTouchCallout", "msTouchCallout", "oTouchCallout",
// 		"contentZooming", "webkitContentZooming", "MozContentZooming", "MSContentZooming", "msContentZooming", "oContentZooming",
// 		"userDrag", "webkitUserDrag", "MozUserDrag", "MSUserDrag", "msUserDrag", "oUserDrag"
// 	];
// 	for (let i = 0; i < props.length; i++) {
// 		if (props[i] in dom.style) {
// 			setStyle(dom, props[i], "");
// 		}
// 	}
// 	// Remove iOS-specific selection;
// 	setStyle(dom, "tapHighlightColor", "");
// }
function iOS() {
    return /apple/i.test(navigator.vendor) && "ontouchend" in document;
}
function getSafeResolution() {
    return iOS() ? 1 : undefined;
}
function relativeToValue(percent, full) {
    if (isNumber(percent)) {
        return percent;
    }
    else if (percent != null && isNumber(percent.value) && isNumber(full)) {
        return full * percent.value;
    }
    else {
        return 0;
    }
}
/**
 * Returns number of decimals
 *
 * @ignore Exclude from docs
 * @param number  Input number
 * @return Number of decimals
 */
function decimalPlaces(number) {
    let match = ('' + number).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
        return 0;
    }
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
}
/**
 * ============================================================================
 * STRING FORMATTING FUNCTIONS
 * ============================================================================
 * @hidden
 */
/**
 * Pads a string with additional characters to certain length.
 *
 * @param value  A numeric value
 * @param len    Result string length in characters
 * @param char   A character to use for padding
 * @return Padded value as string
 */
function padString(value, len = 0, char = "0") {
    if (typeof value !== "string") {
        value = value.toString();
    }
    return len > value.length ? Array(len - value.length + 1).join(char) + value : value;
}
function trimLeft(text) {
    return text.replace(/^[\s]*/, "");
}
function trimRight(text) {
    return text.replace(/[\s]*$/, "");
}
function trim(text) {
    return trimLeft(trimRight(text));
}
function truncateTextWithEllipsis(text, maxLength, breakWords = false, ellipsis = "...") {
    if (text.length > maxLength) {
        // Find the last non-alphanumeric character before maxLength
        let lastNonAlphanumericIndex = maxLength - 1;
        while (lastNonAlphanumericIndex >= 0 && text.charAt(lastNonAlphanumericIndex).match(/\w/)) {
            lastNonAlphanumericIndex--;
        }
        if (lastNonAlphanumericIndex >= 0 && breakWords == false) {
            return text.substring(0, lastNonAlphanumericIndex + 1) + '...';
        }
        else {
            // If no non-alphanumeric character found, truncate without breaking words
            return text.substring(0, maxLength) + ellipsis;
        }
    }
    else {
        return text;
    }
}
/**
 * Cleans up format:
 * * Strips out formatter hints
 *
 * @ignore Exclude from docs
 * @param format  Format
 * @return Cleaned format
 */
function cleanFormat(format) {
    return format.replace(/\/(date|number|duration)$/i, "");
}
/**
 * Strips all tags from the string.
 *
 * @param text  Source string
 * @return String without tags
 */
function stripTags(text) {
    return text ? text.replace(/<[^>]*>/g, "") : text;
}
/**
 * Escapes string so it can safely be used in a Regex.
 *
 * @param value  Unsescaped string
 * @return Escaped string
 */
function escapeForRgex(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
/**
 * Splits the string into separate characters. Keeps RTL words non-split.
 *
 * @param   source  Input
 * @return          Split text
 */
function splitString(source) {
    // Regular expression to identify RTL characters
    const rtlChar = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    // Regular expression to capture segments ending with specific Arabic characters
    const splitPattern = /([^اأدذرزو]*[اأدذرزو])/gi;
    // Split input string into array of words or characters, including whitespace
    let segments = source.split(/(\s+)/); // Split by whitespace, capturing it
    let result = [];
    segments.forEach(segment => {
        if (segment.match(/^\s+$/)) {
            // If the segment is purely whitespace
            if (segment = " ") {
                segment = "  ";
            }
            result.push(segment);
        }
        else if (rtlChar.test(segment)) {
            // If the segment contains RTL characters, handle special splits
            let parts = segment.split(splitPattern).filter(part => part !== '');
            // Concatenate parts processed by the split pattern directly to result
            result = result.concat(parts);
        }
        else {
            // Treat this segment as LTR: split into characters
            result = result.concat([...segment]);
        }
    });
    return result;
}
/**
 * ============================================================================
 * DATE-RELATED FUNCTIONS
 * ============================================================================
 * @hidden
 */
/**
 * Returns a year day.
 *
 * @param date  Date
 * @param utc   Assume UTC dates?
 * @return Year day
 * @todo Account for UTC
 */
function getYearDay(date, utc = false) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
/**
 * Returns week number for a given date.
 *
 * @param date  Date
 * @param utc   Assume UTC dates?
 * @return Week number
 * @todo Account for UTC
 */
function getWeek(date, _utc = false) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const firstDay = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - firstDay.getTime()) / 86400000) + 1) / 7);
}
/**
 * Returns a "week year" of the given date.
 *
 * @param date  Date
 * @param utc   Assume UTC dates?
 * @return Year of week
 * @since 5.3.0
 * @todo Account for UTC
 */
function getWeekYear(date, _utc = false) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const firstDay = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return firstDay.getFullYear();
}
/**
 * Returns a week number in the month.
 *
 * @param date  Source Date
 * @param utc   Assume UTC dates?
 * @return Week number in month
 */
function getMonthWeek(date, utc = false) {
    const firstWeek = getWeek(new Date(date.getFullYear(), date.getMonth(), 1), utc);
    let currentWeek = getWeek(date, utc);
    if (currentWeek == 1) {
        currentWeek = 53;
    }
    return currentWeek - firstWeek + 1;
}
/**
 * Returns a year day out of the given week number.
 *
 * @param week     Week
 * @param year     Year
 * @param weekday  Weekday
 * @param utc      Assume UTC dates
 * @return Day in a year
 */
function getDayFromWeek(week, year, weekday = 1, utc = false) {
    let date = new Date(year, 0, 4, 0, 0, 0, 0);
    if (utc) {
        date.setUTCFullYear(year);
    }
    let day = week * 7 + weekday - ((date.getDay() || 7) + 3);
    return day;
}
/**
 * Returns 12-hour representation out of the 24-hour hours.
 *
 * @param hours  24-hour number
 * @return 12-hour number
 */
function get12Hours(hours, base) {
    if (hours > 12) {
        hours -= 12;
    }
    else if (hours === 0) {
        hours = 12;
    }
    return base != null ? hours + (base - 1) : hours;
}
/**
 * Returns a string name of the time zone.
 *
 * @param date     Date object
 * @param long     Should return long ("Pacific Standard Time") or short abbreviation ("PST")
 * @param savings  Include information if it's in daylight savings mode
 * @param utc      Assume UTC dates
 * @return Time zone name
 */
function getTimeZone(date, long = false, savings = false, utc = false, timezone) {
    if (utc) {
        return long ? "Coordinated Universal Time" : "UTC";
    }
    else if (timezone) {
        const d1 = date.toLocaleString("en-US", { timeZone: timezone });
        const d2 = date.toLocaleString("en-US", { timeZone: timezone, timeZoneName: long ? "long" : "short" });
        return trim(d2.substr(d1.length));
    }
    let wotz = date.toLocaleString("UTC");
    let wtz = date.toLocaleString("UTC", { timeZoneName: long ? "long" : "short" }).substr(wotz.length);
    //wtz = wtz.replace(/[+-]+[0-9]+$/, "");
    if (savings === false) {
        wtz = wtz.replace(/ (standard|daylight|summer|winter) /i, " ");
    }
    return trim(wtz);
}
function getTimezoneOffset(timezone, targetDate) {
    const date = targetDate || new Date(Date.UTC(2012, 0, 1, 0, 0, 0, 0));
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4 * -1;
}
function capitalizeFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
 * The functions below are taken and adapted from Garry Tan's blog post:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * The further attributions go mjijackson.com, which now seems to be defunct.
 */
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * Function adapted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * @param h       The hue
 * @param s       The saturation
 * @param l       The lightness
 * @return The RGB representation
 */
function hslToRgb(color) {
    let r, g, b;
    let h = color.h;
    let s = color.s;
    let l = color.l;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        };
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * Function adapted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * @param r       The red color value
 * @param g       The green color value
 * @param b       The blue color value
 * @return The HSL representation
 */
function rgbToHsl(color) {
    let r = color.r / 255;
    let g = color.g / 255;
    let b = color.b / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: h,
        s: s,
        l: l,
    };
}
/**
 * Returns a color that is `percent` brighter than the reference color.
 *
 * @param color    Reference color
 * @param percent  Brightness percent
 * @return Hex code of the new color
 */
function lighten(rgb, percent) {
    if (rgb) {
        return {
            r: Math.max(0, Math.min(255, rgb.r + getLightnessStep(rgb.r, percent))),
            g: Math.max(0, Math.min(255, rgb.g + getLightnessStep(rgb.g, percent))),
            b: Math.max(0, Math.min(255, rgb.b + getLightnessStep(rgb.b, percent))),
            a: rgb.a
        };
    }
    else {
        // TODO is this correct ?
        return rgb;
    }
}
/**
 * Gets lightness step.
 *
 * @param value    Value
 * @param percent  Percent
 * @return Step
 */
function getLightnessStep(value, percent) {
    let base = percent > 0 ? 255 - value : value;
    return Math.round(base * percent);
}
/**
 * Returns a color that is `percent` brighter than the source `color`.
 *
 * @param color    Source color
 * @param percent  Brightness percent
 * @return New color
 */
function brighten(rgb, percent) {
    if (rgb) {
        let base = Math.min(Math.max(rgb.r, rgb.g, rgb.b), 230);
        //let base = Math.max(rgb.r, rgb.g, rgb.b);
        let step = getLightnessStep(base, percent);
        return {
            r: Math.max(0, Math.min(255, Math.round(rgb.r + step))),
            g: Math.max(0, Math.min(255, Math.round(rgb.g + step))),
            b: Math.max(0, Math.min(255, Math.round(rgb.b + step))),
            a: rgb.a
        };
    }
    else {
        // TODO is this correct ?
        return rgb;
    }
}
/**
 * Returns `true` if color is "light". Useful indetermining which contrasting
 * color to use for elements over this color. E.g.: you would want to use
 * black text over light background, and vice versa.
 *
 * @param color  Source color
 * @return Light?
 */
function isLight(color) {
    return ((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000 >= 128;
}
/**
 * Returns a new [[iRGB]] object based on `rgb` parameter with specific
 * saturation applied.
 *
 * `saturation` can be in the range of 0 (fully desaturated) to 1 (fully
 * saturated).
 *
 * @param color       Base color
 * @param saturation  Saturation (0-1)
 * @return New color
 */
function saturate(rgb, saturation) {
    if (rgb === undefined || saturation == 1) {
        return rgb;
    }
    let hsl = rgbToHsl(rgb);
    hsl.s = saturation;
    return hslToRgb(hsl);
}
/**
 * Returns a color which contrasts more with the source `color`.
 *
 * @param  color             Base color
 * @param  lightAlternative  Light option
 * @param  darkAlternative   Dark option
 * @return New color
 */
function alternativeColor(color, lightAlternative = { r: 255, g: 255, b: 255 }, darkAlternative = { r: 255, g: 255, b: 255 }) {
    let light = lightAlternative;
    let dark = darkAlternative;
    if (isLight(darkAlternative)) {
        light = darkAlternative;
        dark = lightAlternative;
    }
    return isLight(color) ? dark : light;
}
/**
 * @ignore
 */
function mergeTags(tags1, tags2) {
    if (!tags1) {
        tags1 = [];
    }
    return [...tags1, ...tags2].filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}
/**
 * @ignore
 */
function sameBounds(a, b) {
    if (!b) {
        return false;
    }
    if (a.left != b.left) {
        return false;
    }
    if (a.right != b.right) {
        return false;
    }
    if (a.top != b.top) {
        return false;
    }
    if (a.bottom != b.bottom) {
        return false;
    }
    return true;
}

/**
 * @ignore
 */
function string2hex(string) {
    //string = cssColorNames[string.toLowerCase()] || string;
    if (string[0] === "#") {
        string = string.substr(1);
    }
    if (string.length == 3) {
        string = string[0].repeat(2) + string[1].repeat(2) + string[2].repeat(2);
    }
    return parseInt(string, 16);
}
/**
 * @ignore
 */
function rgba2hex(color) {
    color = color.replace(/[ ]/g, "");
    // Init
    let matches = color.match(/^rgb\(([0-9]*),([0-9]*),([0-9]*)\)/i);
    // Try rgb() format
    if (matches) {
        matches.push("1");
    }
    else {
        matches = color.match(/^rgba\(([0-9]*),([0-9]*),([0-9]*),([.0-9]*)\)/i);
        if (!matches) {
            return 0x000000;
        }
    }
    let hex = "";
    for (let i = 1; i <= 3; i++) {
        let val = parseInt(matches[i]).toString(16);
        if (val.length == 1) {
            val = "0" + val;
        }
        hex += val;
    }
    return string2hex(hex);
}
/**
 * Returns a new [[Color]] object base on input.
 *
 * Accepts parameters in CSS hex or rgb/rtba strings, or hex numbers.
 *
 * * `"#f00"`
 * * `"#ff0000"`
 * * `"rgb(255, 0, 0)"`
 * * `"rgba(255, 0, 0, 1)"`
 * * `0xff0000`
 *
 * @param   input  Input color
 * @return         Color
 */
function color(input) {
    return Color.fromAny(input);
}
/**
 * Wherever color needs to be specified in amCharts 5, `Color` object needs to
 * be used.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/} for more info
 * @important
 */
class Color {
    constructor(hex) {
        Object.defineProperty(this, "_hex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._hex = hex | 0;
    }
    /**
     * Color numeric value.
     */
    get hex() {
        return this._hex;
    }
    /**
     * Value of color's R channel.
     * @return R value
     */
    get r() {
        return this._hex >>> 16;
    }
    /**
     * Value of color's G channel.
     * @return G value
     */
    get g() {
        return (this._hex >> 8) & 0xFF;
    }
    /**
     * Value of color's B channel.
     * @return B value
     */
    get b() {
        return this._hex & 0xFF;
    }
    /**
     * Returns color CSS representation in form of `rgba(r, g, b, a)` string.
     *
     * @param   alpha  Opacity
     * @return         CSS string
     */
    toCSS(alpha = 1) {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + alpha + ")";
    }
    /**
     * Returns color CSS representation in form of `#rgb` string.
     *
     * @return         CSS string
     */
    toCSSHex() {
        return "#" + padString(this.r.toString(16), 2) + padString(this.g.toString(16), 2) + padString(this.b.toString(16), 2);
    }
    /**
     * Returns color's HSL info.
     * @param   alpha Opacity
     * @return        HSL info
     */
    toHSL(alpha = 1) {
        return rgbToHsl({
            r: this.r,
            g: this.g,
            b: this.b});
    }
    /**
     * Converts HSL values into a new [[Color]] object.
     *
     * @param   h H value
     * @param   s S value
     * @param   l L value
     * @return    Color object
     */
    static fromHSL(h, s, l) {
        const rgb = hslToRgb({
            h: h,
            s: s,
            l: l
        });
        return this.fromRGB(rgb.r, rgb.g, rgb.b);
    }
    toString() {
        return this.toCSSHex();
    }
    /**
     * Converts hex number into a new [[Color]] object.
     *
     * ```TypeScript
     * Color.fromHex(0xff0000) // red
     * ```
     * ```JavaScript
     * Color.fromHex(0xff0000) // red
     * ```
     *
     * @param   hex  Hex color
     * @return       Color
     */
    static fromHex(hex) {
        return new Color(hex);
    }
    /**
     * Converts RGB values to a new [[Color]] object.
     *
     * @param   r  R value
     * @param   g  G value
     * @param   b  B value
     * @return     Color
     */
    static fromRGB(r, g, b) {
        return new Color((b | 0) + (g << 8) + (r << 16));
    }
    /**
     * Converts RGB string to a new [[Color]] object.
     *
     * ```TypeScript
     * Color.fromString("#ff0000") // red
     * ```
     * ```JavaScript
     * Color.fromString("#ff0000") // red
     * ```
     *
     * @param   s  RGB string
     * @return     Color
     */
    static fromString(s) {
        return new Color(string2hex(s));
    }
    /**
     * Converts CSS rgba() syntax to a new [[Color]] object.
     *
     * ```TypeScript
     * Color.fromCSS("rgba(255, 0, 0, 1)") // red
     * ```
     * ```JavaScript
     * Color.fromCSS("rgba(255, 0, 0, 1)") // red
     * ```
     *
     * @param  {string} s [description]
     * @return {Color}    [description]
     */
    static fromCSS(s) {
        return new Color(rgba2hex(s));
    }
    /**
     * Convert to color from virtually anything.
     *
     * Will throw an exception if unable to resolve the color.
     *
     * @param   s  Source
     * @return     Color
     */
    static fromAny(s) {
        if (isString(s)) {
            if (s[0] == "#") {
                return Color.fromString(s);
            }
            else if (s.substr(0, 3) == "rgb") {
                return Color.fromCSS(s);
            }
        }
        else if (isNumber(s)) {
            return Color.fromHex(s);
        }
        else if (s instanceof Color) {
            return Color.fromHex(s.hex);
        }
        throw new Error("Unknown color syntax: " + s);
    }
    /**
     * Returns a new [[Color]] object based on either `lightAlternative` or
     * `darkAlternative` depending on which one is more contrasting with
     * the `color`.
     *
     * @param   color             Reference color
     * @param   lightAlternative  Light color
     * @param   darkAlternative   Dark color
     * @return                    Alternative color
     */
    static alternative(color, lightAlternative, darkAlternative) {
        const rgb = alternativeColor({ r: color.r, g: color.g, b: color.b }, lightAlternative ? { r: lightAlternative.r, g: lightAlternative.g, b: lightAlternative.b } : undefined, darkAlternative ? { r: darkAlternative.r, g: darkAlternative.g, b: darkAlternative.b } : undefined);
        return this.fromRGB(rgb.r, rgb.g, rgb.b);
    }
    /**
     * Returns an intermediate Color between two reference colors depending on
     * the progress (`diff`) between the two.
     *
     * @param   diff  Progress
     * @param   from  Source color
     * @param   to    Target color
     * @param   mode  Interpolation mode
     * @return        Color
     */
    static interpolate(diff, from, to, mode = "rgb") {
        if (mode == "hsl") {
            const fromHSL = from.toHSL();
            const toHSL = to.toHSL();
            return Color.fromHSL(range(diff, fromHSL.h, toHSL.h), range(diff, fromHSL.s, toHSL.s), range(diff, fromHSL.l, toHSL.l));
        }
        else {
            return Color.fromRGB(range(diff, from.r, to.r), range(diff, from.g, to.g), range(diff, from.b, to.b));
        }
    }
    /**
     * Returns a new [[Color]] lightened by `percent` value.
     *
     * Use negative value to darken the color.
     *
     * @param   color    Source color
     * @param   percent  Percent
     * @return           New color
     */
    static lighten(color, percent) {
        const rgb = lighten({ r: color.r, g: color.g, b: color.b }, percent);
        return Color.fromRGB(rgb.r, rgb.g, rgb.b);
    }
    /**
     * Returns a new [[Color]] brightened by `percent` value.
     *
     * Use negative value to dim the color.
     *
     * @param   color    Source color
     * @param   percent  Percent
     * @return           New color
     */
    static brighten(color, percent) {
        const rgb = brighten({ r: color.r, g: color.g, b: color.b }, percent);
        return Color.fromRGB(rgb.r, rgb.g, rgb.b);
    }
    /**
     * Returns a new [[Color]] saturated by `percent` value.
     *
     * Value range is between `0` (fully desaturated), to `1` (full color).
     *
     * @param   color    Source color
     * @param   percent  Percent
     * @return           New color
     */
    static saturate(color, percent) {
        const rgb = saturate({ r: color.r, g: color.g, b: color.b }, percent);
        return Color.fromRGB(rgb.r, rgb.g, rgb.b);
    }
}

/**
 * Event Dispatcher module is used for registering listeners and dispatching
 * events across amCharts system.
 */
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
/**
 * Universal Event Dispatcher.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/events/} for more info
 */
class EventDispatcher {
    /**
     * Constructor
     */
    constructor() {
        Object.defineProperty(this, "_listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_killed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_iterating", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_enabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._listeners = [];
        this._killed = [];
        this._disabled = {};
        this._iterating = 0;
        this._enabled = true;
        this._disposed = false;
    }
    /**
     * Returns if this object has been already disposed.
     *
     * @return Disposed?
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Dispose (destroy) this object.
     */
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            const a = this._listeners;
            this._iterating = 1;
            this._listeners = null;
            this._disabled = null;
            try {
                each$1(a, (x) => {
                    x.disposer.dispose();
                });
            }
            finally {
                this._killed = null;
                this._iterating = null;
            }
        }
    }
    /**
     * Checks if this particular event dispatcher has any listeners set.
     *
     * @return Has listeners?
     */
    hasListeners() {
        return this._listeners.length !== 0;
    }
    /**
     * Checks if this particular event dispatcher has any particular listeners set.
     *
     * @return Has particular event listeners?
     */
    hasListenersByType(type) {
        return any(this._listeners, (x) => (x.type === null || x.type === type) && !x.killed);
    }
    /**
     * Enable dispatching of events if they were previously disabled by
     * `disable()`.
     */
    enable() {
        this._enabled = true;
    }
    /**
     * Disable dispatching of events until re-enabled by `enable()`.
     */
    disable() {
        this._enabled = false;
    }
    /**
     * Enable dispatching particular event, if it was disabled before by
     * `disableType()`.
     *
     * @param type Event type
     */
    enableType(type) {
        delete this._disabled[type];
    }
    /**
     * Disable dispatching of events for a certain event type.
     *
     * Optionally, can set how many dispatches to skip before automatically
     * re-enabling the dispatching.
     *
     * @param type    Event type
     * @param amount  Number of event dispatches to skip
     */
    disableType(type, amount = Infinity) {
        this._disabled[type] = amount;
    }
    /**
     * Removes listener from dispatcher.
     *
     * Will throw an exception if such listener does not exists.
     *
     * @param listener Listener to remove
     */
    _removeListener(listener) {
        if (this._iterating === 0) {
            const index = this._listeners.indexOf(listener);
            if (index === -1) {
                throw new Error("Invalid state: could not remove listener");
            }
            this._listeners.splice(index, 1);
        }
        else {
            this._killed.push(listener);
        }
    }
    /**
     * Removes existing listener by certain parameters.
     *
     * @param once         Listener's once setting
     * @param type         Listener's type
     * @param callback     Callback function
     * @param context      Callback context
     */
    _removeExistingListener(once, type, callback, context) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        this._eachListener((info) => {
            if (info.once === once && // TODO is this correct ?
                info.type === type &&
                (callback === undefined || info.callback === callback) &&
                info.context === context) {
                info.disposer.dispose();
            }
        });
    }
    /**
     * Checks if dispatching for particular event type is enabled.
     *
     * @param type  Event type
     * @return Enabled?
     */
    isEnabled(type) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        // TODO is this check correct ?
        return this._enabled && this._listeners.length > 0 && this.hasListenersByType(type) && this._disabled[type] === undefined;
    }
    /**
     * Removes all listeners of a particular event type
     *
     * @param type  Listener's type
     */
    removeType(type) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        this._eachListener((info) => {
            if (info.type === type) {
                info.disposer.dispose();
            }
        });
    }
    /**
     * Checks if there's already a listener with specific parameters.
     *
     * @param type      Listener's type
     * @param callback  Callback function
     * @param context   Callback context
     * @return Has listener?
     */
    has(type, callback, context) {
        const index = findIndex(this._listeners, (info) => {
            return info.once !== true && // Ignoring "once" listeners
                info.type === type &&
                (callback === undefined || info.callback === callback) &&
                info.context === context;
        });
        return index !== -1;
    }
    /**
     * Checks whether event of the particular type should be dispatched.
     *
     * @param type  Event type
     * @return Dispatch?
     */
    _shouldDispatch(type) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        const count = this._disabled[type];
        if (!isNumber(count)) {
            return this._enabled;
        }
        else {
            if (count <= 1) {
                delete this._disabled[type];
            }
            else {
                --this._disabled[type];
            }
            return false;
        }
    }
    /**
     * [_eachListener description]
     *
     * All of this extra code is needed when a listener is removed while iterating
     *
     * @todo Description
     * @param fn [description]
     */
    _eachListener(fn) {
        ++this._iterating;
        try {
            each$1(this._listeners, fn);
        }
        finally {
            --this._iterating;
            // TODO should this be inside or outside the finally ?
            if (this._iterating === 0 && this._killed.length !== 0) {
                // Remove killed listeners
                each$1(this._killed, (killed) => {
                    this._removeListener(killed);
                });
                this._killed.length = 0;
            }
        }
    }
    /**
     * Dispatches an event immediately without waiting for next cycle.
     *
     * @param type   Event type
     * @param event  Event object
     * @todo automatically add in type and target properties if they are missing
     */
    dispatch(type, event) {
        if (this._shouldDispatch(type)) {
            // TODO check if it's faster to use an object of listeners rather than a single big array
            // TODO if the function throws, maybe it should keep going ?
            this._eachListener((listener) => {
                if (!listener.killed && (listener.type === null || listener.type === type)) {
                    if (listener._debounceDelay) {
                        if (listener._debounceTimeout) {
                            window.clearTimeout(listener._debounceTimeout);
                        }
                        listener._debounceTimeout = window.setTimeout(() => {
                            listener._debounceTimeout = undefined;
                            if (!listener.killed) {
                                listener.dispatch(type, event);
                            }
                        }, listener._debounceDelay);
                    }
                    else {
                        listener.dispatch(type, event);
                    }
                }
            });
        }
    }
    /**
     * Shelves the event to be dispatched within next update cycle.
     *
     * @param type   Event type
     * @param event  Event object
     * @todo automatically add in type and target properties if they are missing
     */
    /*public dispatchLater<Key extends keyof T>(type: Key, event: T[Key]): void {
        if (this._shouldDispatch(type)) {
            this._eachListener((listener) => {
                // TODO check if it's faster to use an object of listeners rather than a single big array
                if (!listener.killed && (listener.type === null || listener.type === type)) {
                    // TODO if the function throws, maybe it should keep going ?
                    // TODO dispatch during the update cycle, rather than using whenIdle
                    $async.whenIdle(() => {
                        if (!listener.killed) {
                            listener.dispatch(type, event);
                        }
                    });
                }
            });
        }
    }*/
    /**
     * Creates, catalogs and returns an [[EventListener]].
     *
     * Event listener can be disposed.
     *
     * @param once         Listener's once setting
     * @param type         Listener's type
     * @param callback     Callback function
     * @param context      Callback context
     * @param shouldClone  Whether the listener should be copied when the EventDispatcher is copied
     * @param dispatch
     * @returns An event listener
     */
    _on(once, type, callback, context, shouldClone, dispatch, debounceDelay) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        this._removeExistingListener(once, type, callback, context);
        const info = {
            type: type,
            callback: callback,
            context: context,
            shouldClone: shouldClone,
            dispatch: dispatch,
            killed: false,
            once: once,
            disposer: new Disposer(() => {
                info.killed = true;
                if (info._debounceTimeout) {
                    window.clearTimeout(info._debounceTimeout);
                }
                this._removeListener(info);
            }),
            _debounceDelay: debounceDelay
        };
        this._listeners.push(info);
        return info;
    }
    /**
     * Creates an event listener to be invoked on **any** event.
     *
     * @param callback     Callback function
     * @param context      Callback context
     * @param shouldClone  Whether the listener should be copied when the EventDispatcher is copied
     * @returns A disposable event listener
     */
    onAll(callback, context, shouldClone = true) {
        return this._on(false, null, callback, context, shouldClone, (_type, event) => callback.call(context, event)).disposer;
    }
    /**
     * Creates an event listener to be invoked on a specific event type.
     *
     * ```TypeScript
     * button.events.once("click", (ev) => {
     *   console.log("Button clicked");
     * }, this);
     * ```
     * ```JavaScript
     * button.events.once("click", function(ev) {
     *   console.log("Button clicked");
     * }, this);
     * ```
     *
     * The above will invoke our custom event handler whenever series we put
     * event on is hidden.
     *
     * @param type         Listener's type
     * @param callback     Callback function
     * @param context      Callback context
     * @param shouldClone  Whether the listener should be copied when the EventDispatcher is copied
     * @returns A disposable event listener
     */
    on(type, callback, context, shouldClone = true) {
        return this._on(false, type, callback, context, shouldClone, (_type, event) => callback.call(context, event)).disposer;
    }
    /**
     * Creates a debounced event listener to be invoked on a specific event type.
     *
     * ```TypeScript
     * button.events.onDebounced("click", (ev) => {
     *   console.log("Button clicked");
     * }, 500, this);
     * ```
     * ```JavaScript
     * button.events.onDebounced("click", function(ev) {
     *   console.log("Button clicked");
     * }, 500, this);
     * ```
     *
     * The above will invoke our custom event handler whenever series we put
     * event on is hidden.
     *
     * @param type           Listener's type
     * @param callback       Callback function
     * @param debounceDelay  Debounce delay in milliseconds
     * @param context        Callback context
     * @param shouldClone    Whether the listener should be copied when the EventDispatcher is copied
     * @returns A disposable event listener
     * @see {@link https://www.amcharts.com/docs/v5/concepts/events/#Debounced_events} for more info
     * @since 5.14.0
     */
    onDebounced(type, callback, debounceDelay, context, shouldClone = true) {
        return this._on(false, type, callback, context, shouldClone, (_type, event) => callback.call(context, event), debounceDelay).disposer;
    }
    /**
     * Creates an event listener to be invoked on a specific event type once.
     *
     * Once the event listener is invoked, it is automatically disposed.
     *
     * ```TypeScript
     * button.events.once("click", (ev) => {
     *   console.log("Button clicked");
     * }, this);
     * ```
     * ```JavaScript
     * button.events.once("click", function(ev) {
     *   console.log("Button clicked");
     * }, this);
     * ```
     *
     * The above will invoke our custom event handler the first time series we
     * put event on is hidden.
     *
     * @param type         Listener's type
     * @param callback     Callback function
     * @param context      Callback context
     * @param shouldClone  Whether the listener should be copied when the EventDispatcher is copied
     * @returns A disposable event listener
     */
    once(type, callback, context, shouldClone = true) {
        const x = this._on(true, type, callback, context, shouldClone, (_type, event) => {
            x.disposer.dispose();
            callback.call(context, event);
        });
        // TODO maybe this should return a different Disposer ?
        return x.disposer;
    }
    /**
     * Removes the event listener with specific parameters.
     *
     * @param type         Listener's type
     * @param callback     Callback function
     * @param context      Callback context
     */
    off(type, callback, context) {
        this._removeExistingListener(false, type, callback, context);
    }
    /**
     * Copies all dispatcher parameters, including listeners, from another event
     * dispatcher.
     *
     * @param source Source event dispatcher
     * @ignore
     */
    copyFrom(source) {
        if (this._disposed) {
            throw new Error("EventDispatcher is disposed");
        }
        if (source === this) {
            throw new Error("Cannot copyFrom the same TargetedEventDispatcher");
        }
        const disposers = [];
        each$1(source._listeners, (x) => {
            // TODO is this correct ?
            if (!x.killed && x.shouldClone) {
                if (x.type === null) {
                    disposers.push(this.onAll(x.callback, x.context));
                }
                else if (x.once) {
                    disposers.push(this.once(x.type, x.callback, x.context));
                }
                else {
                    disposers.push(this.on(x.type, x.callback, x.context));
                }
            }
        });
        return new MultiDisposer(disposers);
    }
}

/**
 * @ignore
 */
function waitForAnimations(animations) {
    return __awaiter(this, void 0, void 0, function* () {
        if (animations !== undefined) {
            const promises = [];
            each(animations, (_, animation) => {
                promises.push(animation.waitForStop());
            });
            yield Promise.all(promises);
        }
    });
}
/**
 * @ignore
 */
function range(diff, from, to) {
    return from + (diff * (to - from));
}
/**
 * @ignore
 */
function defaultInterpolate(diff, from, to) {
    if (diff >= 1) {
        return to;
    }
    else {
        return from;
    }
}
/**
 * @ignore
 */
function percentInterpolate(diff, from, to) {
    return new Percent(range(diff, from.percent, to.percent));
}
/**
 * @ignore
 */
function colorInterpolate(diff, from, to) {
    return Color.interpolate(diff, from, to);
}
/**
 * @ignore
 */
function getInterpolate(from, to) {
    if (typeof from === "number" && typeof to === "number") {
        return range;
    }
    if (from instanceof Percent && to instanceof Percent) {
        return percentInterpolate;
    }
    if (from instanceof Color && to instanceof Color) {
        return colorInterpolate;
    }
    return defaultInterpolate;
}
var AnimationState;
(function (AnimationState) {
    AnimationState[AnimationState["Stopped"] = 0] = "Stopped";
    AnimationState[AnimationState["Playing"] = 1] = "Playing";
    AnimationState[AnimationState["Paused"] = 2] = "Paused";
})(AnimationState || (AnimationState = {}));
/*export class AnimationValue extends AnimationTime {
    public _min: number;
    public _max: number;

    constructor(entity: Entity, duration: number, min: number, max: number) {
        super(entity, duration);
        this._min = min;
        this._max = max;
    }

    public get min(): number {
        return this._min;
    }

    public set min(value: number) {
        if (this._min !== value) {
            this._min = value;
            this._entity.markDirty();
        }
    }

    public get max(): number {
        return this._max;
    }

    public set max(value: number) {
        if (this._max !== value) {
            this._max = value;
            this._entity.markDirty();
        }
    }

    public currentValue(): number {
        return range(super.currentTime(), this._min, this._max);
    }

    public jumpToValue(value: number) {
        super.jumpToTime(normalize(value, this._min, this._max));
    }

    public tweenToValue(value: number) {
        super.tweenToTime(normalize(value, this._min, this._max));
    }
}
*/

/**
 * Checks if specific index fits into length.
 *
 * @param index  Index
 * @param len    Length
 * @ignore
 */
function checkBounds(index, len) {
    if (!(index >= 0 && index < len)) {
        throw new Error("Index out of bounds: " + index);
    }
}
/**
 * A List class is used to hold a number of indexed items of the same type.
 */
class List {
    /**
     * Constructor
     *
     * @param initial  Inital list of values to add to list
     */
    constructor(initial = []) {
        /**
         * List values.
         */
        Object.defineProperty(this, "_values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventDispatcher()
        });
        this._values = initial;
    }
    /**
     * An array of values in the list.
     *
     * Do not use this property to add values. Rather use dedicated methods, like
     * `push()`, `removeIndex()`, etc.
     *
     * @readonly
     * @return List values
     */
    get values() {
        return this._values;
    }
    /**
     * Checks if list contains specific item reference.
     *
     * @param item  Item to search for
     * @return `true` if found, `false` if not found
     */
    contains(value) {
        return this._values.indexOf(value) !== -1;
    }
    /**
     * Removes specific item from the list.
     *
     * @param item An item to remove
     */
    removeValue(value) {
        let i = 0;
        let length = this._values.length;
        while (i < length) {
            // TODO handle NaN
            if (this._values[i] === value) {
                this.removeIndex(i);
                --length;
            }
            else {
                ++i;
            }
        }
    }
    /**
     * Searches the list for specific item and returns its index.
     *
     * @param item  An item to search for
     * @return Index or -1 if not found
     */
    indexOf(value) {
        return indexOf(this._values, value);
    }
    /**
     * Number of items in list.
     *
     * @readonly
     * @return Number of items
     */
    get length() {
        return this._values.length;
    }
    /**
     * Checks if there's a value at specific index.
     *
     * @param index  Index
     * @return Value exists?
     */
    hasIndex(index) {
        return index >= 0 && index < this._values.length;
    }
    /**
     * Returns an item at specified index.
     *
     * @param index  Index
     * @return List item
     */
    getIndex(index) {
        return this._values[index];
    }
    _onPush(newValue) {
        if (this.events.isEnabled("push")) {
            this.events.dispatch("push", {
                type: "push",
                target: this,
                newValue
            });
        }
    }
    _onInsertIndex(index, newValue) {
        if (this.events.isEnabled("insertIndex")) {
            this.events.dispatch("insertIndex", {
                type: "insertIndex",
                target: this,
                index,
                newValue
            });
        }
    }
    _onSetIndex(index, oldValue, newValue) {
        if (this.events.isEnabled("setIndex")) {
            this.events.dispatch("setIndex", {
                type: "setIndex",
                target: this,
                index,
                oldValue,
                newValue
            });
        }
    }
    _onSwap(a, b) {
        if (this.events.isEnabled("swap")) {
            this.events.dispatch("swap", {
                type: "swap",
                target: this,
                a,
                b
            });
        }
    }
    _onRemoveIndex(index, oldValue) {
        if (this.events.isEnabled("removeIndex")) {
            this.events.dispatch("removeIndex", {
                type: "removeIndex",
                target: this,
                index,
                oldValue
            });
        }
    }
    _onMoveIndex(oldIndex, newIndex, value) {
        if (this.events.isEnabled("moveIndex")) {
            this.events.dispatch("moveIndex", {
                type: "moveIndex",
                target: this,
                oldIndex,
                newIndex,
                value,
            });
        }
    }
    _onClear(oldValues) {
        if (this.events.isEnabled("clear")) {
            this.events.dispatch("clear", {
                type: "clear",
                target: this,
                oldValues
            });
        }
    }
    /**
     * Sets value at specific index.
     *
     * If there's already a value at the index, it is overwritten.
     *
     * @param index  Index
     * @param value  New value
     * @return New value
     */
    setIndex(index, value) {
        checkBounds(index, this._values.length);
        const oldValue = this._values[index];
        // Do nothing if the old value and the new value are the same
        if (oldValue !== value) {
            this._values[index] = value;
            this._onSetIndex(index, oldValue, value);
        }
        return oldValue;
    }
    /**
     * Adds an item to the list at a specific index, which pushes all the other
     * items further down the list.
     *
     * @param index Index
     * @param item  An item to add
     */
    insertIndex(index, value) {
        checkBounds(index, this._values.length + 1);
        insertIndex(this._values, index, value);
        this._onInsertIndex(index, value);
        return value;
    }
    /**
     * Swaps indexes of two items in the list.
     *
     * @param a  Item 1
     * @param b  Item 2
     */
    swap(a, b) {
        const len = this._values.length;
        checkBounds(a, len);
        checkBounds(b, len);
        if (a !== b) {
            const value_a = this._values[a];
            const value_b = this._values[b];
            this._values[a] = value_b;
            this._values[b] = value_a;
            this._onSwap(value_a, value_b);
        }
    }
    /**
     * Removes a value at specific index.
     *
     * @param index  Index of value to remove
     * @return Removed value
     */
    removeIndex(index) {
        checkBounds(index, this._values.length);
        const oldValue = this._values[index];
        removeIndex(this._values, index);
        this._onRemoveIndex(index, oldValue);
        return oldValue;
    }
    /**
     * Moves an item to a specific index within the list.
     *
     * If the index is not specified it will move the item to the end of the
     * list.
     *
     * @param value  Item to move
     * @param index  Index to place item at
     */
    moveValue(value, toIndex) {
        // TODO don't do anything if the desired index is the same as the current index
        let index = this.indexOf(value);
        // TODO remove all old values rather than only the first ?
        if (index !== -1) {
            removeIndex(this._values, index);
            if (toIndex == null) {
                const toIndex = this._values.length;
                this._values.push(value);
                this._onMoveIndex(index, toIndex, value);
            }
            else {
                insertIndex(this._values, toIndex, value);
                this._onMoveIndex(index, toIndex, value);
            }
        }
        else if (toIndex == null) {
            this._values.push(value);
            this._onPush(value);
        }
        else {
            insertIndex(this._values, toIndex, value);
            this._onInsertIndex(toIndex, value);
        }
        return value;
    }
    /**
     * Adds an item to the end of the list.
     *
     * @param item  An item to add
     */
    push(value) {
        this._values.push(value);
        this._onPush(value);
        return value;
    }
    /**
     * Adds an item as a first item in the list.
     *
     * @param item  An item to add
     */
    unshift(value) {
        this.insertIndex(0, value);
        return value;
    }
    /**
     * Adds multiple items to the list.
     *
     * @param items  An Array of items to add
     */
    pushAll(values) {
        each$1(values, (value) => {
            this.push(value);
        });
    }
    /**
     * Copies and adds items from abother list.
     *
     * @param source  A list top copy items from
     */
    copyFrom(source) {
        this.pushAll(source._values);
    }
    /**
     * Returns the last item from the list, and removes it.
     *
     * @return Item
     */
    pop() {
        let index = this._values.length - 1;
        return index < 0 ? undefined : this.removeIndex(this._values.length - 1);
    }
    /**
     * Returns the first item from the list, and removes it.
     *
     * @return Item
     */
    shift() {
        return this._values.length ? this.removeIndex(0) : undefined;
    }
    /**
     * Sets multiple items to the list.
     *
     * All current items are removed.
     *
     * @param newArray  New items
     */
    setAll(newArray) {
        const old = this._values;
        this._values = [];
        this._onClear(old);
        each$1(newArray, (value) => {
            this._values.push(value);
            this._onPush(value);
        });
    }
    /**
     * Removes all items from the list.
     */
    clear() {
        this.setAll([]);
    }
    /**
     * Returns an ES6 iterator for the list.
     */
    *[Symbol.iterator]() {
        const length = this._values.length;
        for (let i = 0; i < length; ++i) {
            yield this._values[i];
        }
    }
    /**
     * Calls `f` for each element in the list.
     *
     * `f` should have at least one parameter defined which will get a current
     * item, with optional second argument - index.
     */
    each(f) {
        each$1(this._values, f);
    }
    /**
     * Calls `f` for each element in the list, from right to left.
     *
     * `f` should have at least one parameter defined which will get a current
     * item, with optional second argument - index.
     */
    eachReverse(f) {
        eachReverse(this._values, f);
    }
}
/**
 * A version of a [[List]] where the elements are disposed automatically when
 * removed from the list, unless `autoDispose` is set to `false`.
 */
class ListAutoDispose extends List {
    constructor() {
        super(...arguments);
        /**
         * Automatically disposes elements that are removed from the list.
         *
         * @default true
         */
        Object.defineProperty(this, "autoDispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /**
     * Swaps indexes of two items in the list.
     *
     * @param a  Item 1
     * @param b  Item 2
     */
    swap(a, b) {
        const currentAutoDispose = this.autoDispose;
        this.autoDispose = false;
        super.swap(a, b);
        this.autoDispose = currentAutoDispose;
    }
    _onSetIndex(index, oldValue, newValue) {
        if (this.autoDispose) {
            oldValue.dispose();
        }
        super._onSetIndex(index, oldValue, newValue);
    }
    _onRemoveIndex(index, oldValue) {
        if (this.autoDispose) {
            oldValue.dispose();
        }
        super._onRemoveIndex(index, oldValue);
    }
    _onClear(oldValues) {
        if (this.autoDispose) {
            each$1(oldValues, (x) => {
                x.dispose();
            });
        }
        super._onClear(oldValues);
    }
    _dispose() {
        if (this.autoDispose) {
            each$1(this._values, (x) => {
                x.dispose();
            });
        }
    }
    isDisposed() {
        return this._disposed;
    }
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._dispose();
        }
    }
}
/**
 * A version of a [[List]] that is able to create new elements as well as
 * apply additional settings to newly created items.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/list-templates/} for more info
 */
class ListTemplate extends ListAutoDispose {
    constructor(template, make) {
        super();
        Object.defineProperty(this, "template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "make", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.template = template;
        this.make = make;
    }
    _dispose() {
        super._dispose();
        if (this.autoDispose) {
            this.template.dispose();
        }
    }
}

/**
 * A version of [[List]] to hold children of the [[Container]].
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/containers/} for more info
 */
class Children extends List {
    constructor(container) {
        super();
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._container = container;
        this._events = this.events.onAll((change) => {
            if (change.type === "clear") {
                each$1(change.oldValues, (x) => {
                    this._onRemoved(x);
                });
            }
            else if (change.type === "push") {
                this._onInserted(change.newValue);
            }
            else if (change.type === "setIndex") {
                this._onRemoved(change.oldValue);
                this._onInserted(change.newValue, change.index);
            }
            else if (change.type === "insertIndex") {
                this._onInserted(change.newValue, change.index);
            }
            else if (change.type === "removeIndex") {
                this._onRemoved(change.oldValue);
            }
            else if (change.type === "moveIndex") {
                this._onRemoved(change.value);
                this._onInserted(change.value, change.newIndex);
            }
            else {
                throw new Error("Unknown IListEvent type");
            }
        });
    }
    _onInserted(child, index) {
        child._setParent(this._container, true);
        const childrenDisplay = this._container._childrenDisplay;
        if (index === undefined) {
            childrenDisplay.addChild(child._display);
        }
        else {
            childrenDisplay.addChildAt(child._display, index);
        }
    }
    _onRemoved(child) {
        this._container._childrenDisplay.removeChild(child._display);
        this._container.markDirtyBounds();
        this._container.markDirty();
    }
    /**
     * Returns `true` if obejct is disposed.
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Permanently dispose this object.
     */
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._events.dispose();
            each$1(this.values, (child) => {
                child.dispose();
            });
        }
    }
}

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 * @hidden
 */
const PI = Math.PI;
const RADIANS = PI / 180;
const DEGREES = 180 / PI;
/**
 * Rounds the numeric value to whole number or specific precision of set.
 *
 * @param value      Value
 * @param precision  Precision (number of decimal points)
 * @param floor  In case value ends with 0.5 and precision is 0, we might need to floor the value instead of ceiling it.
 * @return Rounded value
 */
function round$1(value, precision, floor) {
    if (!isNumber(precision) || precision <= 0) {
        let rounded = Math.round(value);
        return rounded;
    }
    else {
        let d = Math.pow(10, precision);
        return Math.round(value * d) / d;
    }
}
/**
 * Ceils the numeric value to whole number or specific precision of set.
 *
 * @param value      Value
 * @param precision  Precision (number of decimal points)
 * @return Rounded value
 */
function ceil(value, precision) {
    if (!isNumber(precision) || precision <= 0) {
        return Math.ceil(value);
    }
    else {
        let d = Math.pow(10, precision);
        return Math.ceil(value * d) / d;
    }
}
function fitToRange(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Returns sine of an angle specified in degrees.
 *
 * @param value  Value
 * @return Sine
 */
function sin(angle) {
    return Math.sin(RADIANS * angle);
}
/**
 * Returns cosine of an angle specified in degrees.
 *
 * @param value  Value
 * @return Cosine
 */
function cos(angle) {
    return Math.cos(RADIANS * angle);
}
// 0 to 360
function normalizeAngle(value) {
    value = value % 360;
    if (value < 0) {
        value += 360;
    }
    return value;
}
// TODO this doesn't work properly for skewing, and it's probably broken for rotation too
function getArcBounds(cx, cy, startAngle, endAngle, radius) {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;
    let bpoints = [];
    bpoints.push(getArcPoint(radius, startAngle));
    bpoints.push(getArcPoint(radius, endAngle));
    let fromAngle = Math.min(Math.floor(startAngle / 90) * 90, Math.floor(endAngle / 90) * 90);
    let toAngle = Math.max(Math.ceil(startAngle / 90) * 90, Math.ceil(endAngle / 90) * 90);
    for (let angle = fromAngle; angle <= toAngle; angle += 90) {
        if (angle >= startAngle && angle <= endAngle) {
            bpoints.push(getArcPoint(radius, angle));
        }
    }
    for (let i = 0; i < bpoints.length; i++) {
        let pt = bpoints[i];
        if (pt.x < minX) {
            minX = pt.x;
        }
        if (pt.y < minY) {
            minY = pt.y;
        }
        if (pt.x > maxX) {
            maxX = pt.x;
        }
        if (pt.y > maxY) {
            maxY = pt.y;
        }
    }
    return ({ left: cx + minX, top: cy + minY, right: cx + maxX, bottom: cy + maxY });
}
/**
 * Returns point on arc
 *
 * @param center point
 * @param radius
 * @param arc
 * @return {boolean}
 */
function getArcPoint(radius, arc) {
    return ({ x: radius * cos(arc), y: radius * sin(arc) });
}
function mergeBounds(bounds) {
    const len = bounds.length;
    if (len > 0) {
        let bound = bounds[0];
        let left = bound.left;
        let top = bound.top;
        let right = bound.right;
        let bottom = bound.bottom;
        if (len > 1) {
            for (let i = 1; i < len; i++) {
                bound = bounds[i];
                left = Math.min(bound.left, left);
                right = Math.max(bound.right, right);
                top = Math.min(bound.top, top);
                bottom = Math.max(bound.bottom, bottom);
            }
        }
        return { left, right, top, bottom };
    }
    return { left: 0, right: 0, top: 0, bottom: 0 };
}
function inBounds(point, bounds) {
    if (point.x >= bounds.left && point.y >= bounds.top && point.x <= bounds.right && point.y <= bounds.bottom) {
        return true;
    }
    return false;
}

/**
 * A collection of easing functions
 *
 * Parts of this collection are taken from D3.js library (https://d3js.org/)
 */
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
/**
 * The functions below are from D3.js library (https://d3js.org/)
 *
 * ----------------------------------------------------------------------------
 * Copyright 2017 Mike Bostock
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *	this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *	this list of conditions and the following disclaimer in the documentation
 *	and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *	contributors may be used to endorse or promote products derived from this
 *	software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 * ----------------------------------------------------------------------------
 * @hidden
 */
/**
 */
function linear(t) {
    return t;
}
function cubic(t) {
    return t * t * t;
}
function out(ease) {
    return function (t) {
        return 1.0 - ease(1.0 - t);
    };
}

/**
 * An object representing a collection of setting values to apply as required.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/states/} for more info
 */
class State {
    constructor(entity, settings) {
        Object.defineProperty(this, "_entity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_userSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this._entity = entity;
        this._settings = settings;
        each(settings, (key) => {
            this._userSettings[key] = true;
        });
    }
    get(key, fallback) {
        const value = this._settings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    /**
     * @ignore
     */
    setRaw(key, value) {
        this._settings[key] = value;
    }
    /**
     * Sets a setting `value` for the specified `key` to be set when the state
     * is applied.
     *
     * @param   key       Setting key
     * @param   value     Setting value
     * @return            Setting value
     */
    set(key, value) {
        this._userSettings[key] = true;
        this.setRaw(key, value);
    }
    /**
     * Removes a setting value for the specified `key`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     */
    remove(key) {
        delete this._userSettings[key];
        delete this._settings[key];
    }
    /**
     * Sets multiple settings at once.
     *
     * `settings` must be an object with key: value pairs.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param settings Settings
     */
    setAll(settings) {
        keys(settings).forEach((key) => {
            this.set(key, settings[key]);
        });
    }
    _eachSetting(f) {
        each(this._settings, f);
    }
    /**
     * Applies the state to the target element.
     *
     * All setting values are set immediately.
     */
    apply() {
        const seen = {};
        seen["stateAnimationEasing"] = true;
        seen["stateAnimationDuration"] = true;
        const defaultState = this._entity.states.lookup("default");
        this._eachSetting((key, value) => {
            if (!seen[key]) {
                seen[key] = true;
                // save values to default state
                if (this !== defaultState) {
                    if (!(key in defaultState._settings)) {
                        defaultState._settings[key] = this._entity.get(key);
                    }
                }
                this._entity.set(key, value);
            }
        });
    }
    /**
     * Applies the state to the target element.
     *
     * Returns an object representing all [[Animation]] objects created for
     * each setting key transition.
     *
     * @return           Animations
     */
    applyAnimate(duration) {
        if (duration == null) {
            duration = this._settings.stateAnimationDuration;
        }
        if (duration == null) {
            duration = this.get("stateAnimationDuration", this._entity.get("stateAnimationDuration", 0));
        }
        let easing = this._settings.stateAnimationEasing;
        if (easing == null) {
            easing = this.get("stateAnimationEasing", this._entity.get("stateAnimationEasing", cubic));
        }
        const defaultState = this._entity.states.lookup("default");
        const seen = {};
        seen["stateAnimationEasing"] = true;
        seen["stateAnimationDuration"] = true;
        const animations = {};
        this._eachSetting((key, value) => {
            if (!seen[key]) {
                seen[key] = true;
                // save values to default state
                if (this != defaultState) {
                    if (!(key in defaultState._settings)) {
                        defaultState._settings[key] = this._entity.get(key);
                    }
                }
                const animation = this._entity.animate({
                    key: key,
                    to: value,
                    duration: duration,
                    easing: easing
                });
                if (animation) {
                    animations[key] = animation;
                }
            }
        });
        return animations;
    }
}
/**
 * Collection of [[State]] objects for an element.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/states/} for more info
 */
class States {
    constructor(entity) {
        Object.defineProperty(this, "_states", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_entity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._entity = entity;
    }
    /**
     * Checks if a state by `name` exists. Returns it there is one.
     *
     * @param  name  State name
     * @return       State
     */
    lookup(name) {
        return this._states[name];
    }
    /**
     * Sets supplied `settings` on a state by the `name`.
     *
     * If such state does not yet exists, it is created.
     *
     * @param   name      State name
     * @param   settings  Settings
     * @return            New State
     */
    create(name, settings) {
        const state = this._states[name];
        if (state) {
            state.setAll(settings);
            return state;
        }
        else {
            const state = new State(this._entity, settings);
            this._states[name] = state;
            return state;
        }
    }
    /**
     * Removes the state called `name`.
     *
     * @param   name      State name
     */
    remove(name) {
        delete this._states[name];
    }
    /**
     * Applies a named state to the target element.
     *
     * @param  newState  State name
     */
    apply(newState) {
        const state = this._states[newState];
        if (state) {
            state.apply();
        }
        this._entity._applyState(newState);
    }
    /**
     * Applies a named state to the element.
     *
     * Returns an object representing all [[Animation]] objects created for
     * each setting key transition.
     *
     * @param   newState  State name
     * @return            Animations
     */
    applyAnimate(newState, duration) {
        let animations;
        const state = this._states[newState];
        if (state) {
            animations = state.applyAnimate(duration);
        }
        this._entity._applyStateAnimated(newState, duration);
        return animations;
    }
}

/**
 * @ignore
 */
class Registry {
    constructor() {
        /**
         * Currently running version of amCharts.
         */
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "5.14.3"
        });
        /**
         * List of applied licenses.
         * @ignore
         */
        Object.defineProperty(this, "licenses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /**
         * Entities that have their `id` setting set.
         */
        Object.defineProperty(this, "entitiesById", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        /**
         * All created [[Root]] elements.
         */
        Object.defineProperty(this, "rootElements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
/**
    * @ignore
 */
const registry = new Registry();

/**
 * @ignore
 */
function compare(left, right) {
    if (left === right) {
        return 0;
    }
    else if (left < right) {
        return -1;
    }
    else {
        return 1;
    }
}
/**
 * @ignore
 */
function compareArray(left, right, f) {
    const leftLength = left.length;
    const rightLength = right.length;
    const length = Math.min(leftLength, rightLength);
    for (let i = 0; i < length; ++i) {
        const order = f(left[i], right[i]);
        if (order !== 0) {
            return order;
        }
    }
    return compare(leftLength, rightLength);
}
/**
 * @ignore
 */
function compareNumber(a, b) {
    if (a === b) {
        return 0;
    }
    else if (a < b) {
        return -1;
    }
    else {
        return 1;
    }
}

/**
 * Allows to dynamically modify setting value of its target element.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/adapters/} for more info
 */
class Adapters {
    constructor(entity) {
        Object.defineProperty(this, "_entity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this._entity = entity;
    }
    /**
     * Add a function (`callback`) that will modify value for setting `key`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/adapters/} for more info
     */
    add(key, callback) {
        let callbacks = this._callbacks[key];
        if (callbacks === undefined) {
            callbacks = this._callbacks[key] = [];
        }
        callbacks.push(callback);
        this._entity._markDirtyKey(key);
        return new Disposer(() => {
            if (removeFirst(callbacks, callback)) {
                this._entity._markDirtyKey(key);
            }
        });
    }
    /**
     * Removes all adapters for the specific key.
     *
     * @since 5.1.0
     */
    remove(key) {
        const callbacks = this._callbacks[key];
        if (callbacks !== undefined) {
            delete this._callbacks[key];
            if (callbacks.length !== 0) {
                this._entity._markDirtyKey(key);
            }
        }
    }
    /**
     * Enables (previously disabled) adapters for specific key.
     *
     * @since 5.1.0
     */
    enable(key) {
        if (this._disabled[key]) {
            delete this._disabled[key];
            this._entity._markDirtyKey(key);
        }
    }
    /**
     * Disables all adapters for specific key.
     *
     * @since 5.1.0
     */
    disable(key) {
        if (!this._disabled[key]) {
            this._disabled[key] = true;
            this._entity._markDirtyKey(key);
        }
    }
    /**
     * @ignore
     */
    fold(key, value) {
        if (!this._disabled[key]) {
            const callbacks = this._callbacks[key];
            if (callbacks !== undefined) {
                for (let i = 0, len = callbacks.length; i < len; ++i) {
                    value = callbacks[i](value, this._entity, key);
                }
            }
        }
        return value;
    }
}
/**
 * Animation object.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/animations/} for more info
 */
class Animation {
    constructor(animation, from, to, duration, easing, loops, startingTime) {
        Object.defineProperty(this, "_animation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_from", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_easing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_loops", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_interpolate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_oldTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_stopped", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_playing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventDispatcher()
        });
        this._animation = animation;
        this._from = from;
        this._to = to;
        this._duration = duration;
        this._easing = easing;
        this._loops = loops;
        this._interpolate = getInterpolate(from, to);
        this._oldTime = startingTime;
    }
    get to() {
        return this._to;
    }
    get from() {
        return this._from;
    }
    get playing() {
        return this._playing;
    }
    get stopped() {
        return this._stopped;
    }
    stop() {
        if (!this._stopped) {
            this._stopped = true;
            this._playing = false;
            if (this.events.isEnabled("stopped")) {
                this.events.dispatch("stopped", {
                    type: "stopped",
                    target: this,
                });
            }
        }
    }
    pause() {
        this._playing = false;
        this._oldTime = null;
    }
    play() {
        if (!this._stopped && !this._playing) {
            this._playing = true;
            this._animation._startAnimation();
        }
    }
    get percentage() {
        return this._time / this._duration;
    }
    waitForStop() {
        return new Promise((resolve, _reject) => {
            if (this._stopped) {
                resolve();
            }
            else {
                const listener = () => {
                    stopped.dispose();
                    resolve();
                };
                const stopped = this.events.on("stopped", listener);
            }
        });
    }
    _checkEnded() {
        if (this._loops > 1) {
            --this._loops;
            return false;
        }
        else {
            return true;
        }
    }
    _run(currentTime) {
        if (this._oldTime !== null) {
            this._time += currentTime - this._oldTime;
            if (this._time > this._duration) {
                this._time = this._duration;
            }
        }
        this._oldTime = currentTime;
    }
    _reset(currentTime) {
        this._oldTime = currentTime;
        this._time = 0;
    }
    _value(diff) {
        return this._interpolate(this._easing(diff), this._from, this._to);
    }
}
/**
 * @ignore
 */
let counter = 0;
/**
 * Base class for [[Entity]] objects that support Settings.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
 */
class Settings {
    constructor(settings) {
        /**
         * Unique ID.
         */
        Object.defineProperty(this, "uid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ++counter
        });
        Object.defineProperty(this, "_settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_privateSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_settingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_privateSettingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_prevSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_prevPrivateSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_animatingSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_animatingPrivateSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // TODO move this into Entity
        Object.defineProperty(this, "_userProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        /**
         * If this is set to `false` then disposing does nothing, it's a no-op.
         */
        Object.defineProperty(this, "enableDispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this._settings = settings;
    }
    _checkDirty() {
        keys(this._settings).forEach((key) => {
            this._userProperties[key] = true;
            this._markDirtyKey(key);
        });
    }
    /**
     * @ignore
     */
    resetUserSettings() {
        this._userProperties = {};
    }
    _runAnimation(currentTime) {
        let state = AnimationState.Stopped;
        if (!this.isDisposed()) {
            let playing = false;
            let paused = false;
            each(this._animatingSettings, (key, animation) => {
                if (animation.stopped) {
                    this._stopAnimation(key);
                }
                else if (animation.playing) {
                    animation._run(currentTime);
                    const diff = animation.percentage;
                    if (diff >= 1) {
                        if (animation._checkEnded()) {
                            this.set(key, animation._value(1));
                        }
                        else {
                            playing = true;
                            animation._reset(currentTime);
                            this._set(key, animation._value(1));
                        }
                    }
                    else {
                        playing = true;
                        this._set(key, animation._value(diff));
                    }
                }
                else {
                    paused = true;
                }
            });
            each(this._animatingPrivateSettings, (key, animation) => {
                if (animation.stopped) {
                    this._stopAnimationPrivate(key);
                }
                else if (animation.playing) {
                    animation._run(currentTime);
                    const diff = animation.percentage;
                    if (diff >= 1) {
                        if (animation._checkEnded()) {
                            this.setPrivate(key, animation._value(1));
                        }
                        else {
                            playing = true;
                            animation._reset(currentTime);
                            this._setPrivate(key, animation._value(1));
                        }
                    }
                    else {
                        playing = true;
                        this._setPrivate(key, animation._value(diff));
                    }
                }
                else {
                    paused = true;
                }
            });
            if (playing) {
                state = AnimationState.Playing;
            }
            else if (paused) {
                state = AnimationState.Paused;
            }
        }
        return state;
    }
    _markDirtyKey(_key) {
        this.markDirty();
    }
    _markDirtyPrivateKey(_key) {
        this.markDirty();
    }
    /**
     * Sets a callback function to invoke when specific key of settings changes
     * or is set.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/events/#Settings_value_change} for more info
     * @param   key       Settings key
     * @param   callback  Callback
     * @return            Disposer for event
     */
    on(key, callback) {
        let events = this._settingEvents[key];
        if (events === undefined) {
            events = this._settingEvents[key] = [];
        }
        events.push(callback);
        return new Disposer(() => {
            removeFirst(events, callback);
            if (events.length === 0) {
                delete this._settingEvents[key];
            }
        });
    }
    /**
     * Removes a callback for when value of a setting changes.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/events/#Settings_value_change} for more info
     * @param   key       Private settings key
     * @param   callback  Callback
     * @since 5.9.2
     */
    off(key, callback) {
        let events = this._settingEvents[key];
        if (events !== undefined && callback !== undefined) {
            removeFirst(events, callback);
        }
        else {
            delete this._settingEvents[key];
        }
    }
    /**
     * Sets a callback function to invoke when specific key of private settings
     * changes or is set.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/events/#Settings_value_change} for more info
     * @param   key       Private settings key
     * @param   callback  Callback
     * @return            Disposer for event
     */
    onPrivate(key, callback) {
        let events = this._privateSettingEvents[key];
        if (events === undefined) {
            events = this._privateSettingEvents[key] = [];
        }
        events.push(callback);
        return new Disposer(() => {
            removeFirst(events, callback);
            if (events.length === 0) {
                delete this._privateSettingEvents[key];
            }
        });
    }
    /**
     * Removes a callback for when value of a private setting changes.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/events/#Settings_value_change} for more info
     * @param   key       Private settings key
     * @param   callback  Callback
     * @since 5.9.2
     */
    offPrivate(key, callback) {
        let events = this._privateSettingEvents[key];
        if (events !== undefined && callback !== undefined) {
            removeFirst(events, callback);
        }
        else {
            delete this._privateSettingEvents[key];
        }
    }
    /**
     * @ignore
     */
    getRaw(key, fallback) {
        const value = this._settings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    /**
     * Returns `true` if the setting exists.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key        Settings key
     * @return  {boolean}  Key exists
     */
    has(key) {
        return key in this._settings;
    }
    get(key, fallback) {
        return this.getRaw(key, fallback);
    }
    _sendKeyEvent(key, value) {
        const events = this._settingEvents[key];
        if (events !== undefined) {
            each$1(events, (callback) => {
                callback(value, this, key);
            });
        }
    }
    _sendPrivateKeyEvent(key, value) {
        const events = this._privateSettingEvents[key];
        if (events !== undefined) {
            each$1(events, (callback) => {
                callback(value, this, key);
            });
        }
    }
    /**
     * @ignore
     */
    _setRaw(key, old, value) {
        this._prevSettings[key] = old;
        this._sendKeyEvent(key, value);
    }
    /**
     * @ignore
     */
    setRaw(key, value) {
        const old = this._settings[key];
        this._settings[key] = value;
        if (old !== value) {
            this._setRaw(key, old, value);
        }
    }
    /**
     * @ignore
     */
    _set(key, value) {
        const old = this._settings[key];
        this._settings[key] = value;
        if (old !== value) {
            this._setRaw(key, old, value);
            this._markDirtyKey(key);
        }
    }
    _stopAnimation(key) {
        const animation = this._animatingSettings[key];
        if (animation) {
            delete this._animatingSettings[key];
            animation.stop();
        }
    }
    /**
     * Sets a setting `value` for the specified `key`, and returns the same `value`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     * @param   value     Setting value
     * @return            Setting value
     */
    set(key, value) {
        this._set(key, value);
        this._stopAnimation(key);
        return value;
    }
    /**
     * Removes a setting value for the specified `key`;
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     */
    remove(key) {
        if (key in this._settings) {
            this._prevSettings[key] = this._settings[key];
            delete this._settings[key];
            this._sendKeyEvent(key, undefined);
            this._markDirtyKey(key);
        }
        this._stopAnimation(key);
    }
    /**
     * Removes all keys;
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     */
    removeAll() {
        each$1(keys(this._settings), (key) => {
            this.remove(key);
        });
    }
    /**
     * Returns a value of a private setting.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/#Private_settings} for more info
     */
    getPrivate(key, fallback) {
        const value = this._privateSettings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    /**
     * @ignore
     */
    _setPrivateRaw(key, old, value) {
        this._prevPrivateSettings[key] = old;
        this._sendPrivateKeyEvent(key, value);
    }
    /**
     * @ignore
     */
    setPrivateRaw(key, value) {
        const old = this._privateSettings[key];
        this._privateSettings[key] = value;
        if (old !== value) {
            this._setPrivateRaw(key, old, value);
        }
    }
    /**
     * @ignore
     */
    _setPrivate(key, value) {
        const old = this._privateSettings[key];
        this._privateSettings[key] = value;
        if (old !== value) {
            this._setPrivateRaw(key, old, value);
            this._markDirtyPrivateKey(key);
        }
    }
    _stopAnimationPrivate(key) {
        const animation = this._animatingPrivateSettings[key];
        if (animation) {
            animation.stop();
            delete this._animatingPrivateSettings[key];
        }
    }
    /**
     * @ignore
     */
    setPrivate(key, value) {
        this._setPrivate(key, value);
        this._stopAnimationPrivate(key);
        return value;
    }
    /**
     * @ignore
     */
    removePrivate(key) {
        if (key in this._privateSettings) {
            this._prevPrivateSettings[key] = this._privateSettings[key];
            delete this._privateSettings[key];
            this._markDirtyPrivateKey(key);
        }
        this._stopAnimationPrivate(key);
    }
    /**
     * Sets multiple settings at once.
     *
     * `settings` must be an object with key: value pairs.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param settings Settings
     */
    setAll(settings) {
        each(settings, (key, value) => {
            this.set(key, value);
        });
    }
    /**
     * Animates setting values from current/start values to new ones.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/animations/#Animating_settings} for more info
     * @param   options  Animation options
     * @return           Animation object
     */
    animate(options) {
        const key = options.key;
        const to = options.to;
        const duration = options.duration || 0;
        const loops = options.loops || 1;
        const from = (options.from === undefined ? this.get(key) : options.from);
        const easing = (options.easing === undefined ? linear : options.easing);
        if (duration === 0) {
            this.set(key, to);
        }
        else {
            if (from === undefined || from === to) {
                this.set(key, to);
            }
            else {
                this.set(key, from);
                const animation = this._animatingSettings[key] = new Animation(this, from, to, duration, easing, loops, this._animationTime());
                this._startAnimation();
                return animation;
            }
        }
        const animation = new Animation(this, from, to, duration, easing, loops, null);
        animation.stop();
        return animation;
    }
    /**
     * @ignore
     */
    animatePrivate(options) {
        const key = options.key;
        const to = options.to;
        const duration = options.duration || 0;
        const loops = options.loops || 1;
        const from = (options.from === undefined ? this.getPrivate(key) : options.from);
        const easing = (options.easing === undefined ? linear : options.easing);
        if (duration === 0) {
            this.setPrivate(key, to);
        }
        else {
            if (from === undefined || from === to) {
                this.setPrivate(key, to);
            }
            else {
                this.setPrivate(key, from);
                const animation = this._animatingPrivateSettings[key] = new Animation(this, from, to, duration, easing, loops, this._animationTime());
                this._startAnimation();
                return animation;
            }
        }
        const animation = new Animation(this, from, to, duration, easing, loops, null);
        animation.stop();
        return animation;
    }
    _dispose() { }
    /**
     * Returns `true` if this element is disposed.
     *
     * @return Disposed
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Disposes this object.
     */
    dispose() {
        if (this.enableDispose && !this._disposed) {
            this._disposed = true;
            this._dispose();
        }
    }
}
/**
 * Base class.
 *
 * @important
 */
class Entity extends Settings {
    /**
     * IMPORTANT! Do not instantiate this class via `new Class()` syntax.
     *
     * Use static method `Class.new()` instead.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/#New_element_syntax} for more info
     * @ignore
     */
    constructor(root, settings, isReal, templates = []) {
        super(settings);
        Object.defineProperty(this, "_root", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_user_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // for testing purposes
        Object.defineProperty(this, "states", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new States(this)
        });
        Object.defineProperty(this, "adapters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Adapters(this)
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._createEvents()
        });
        Object.defineProperty(this, "_userPrivateProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dirtyPrivate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Templates for the themes
        Object.defineProperty(this, "_templates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Internal templates which can be overridden by the user's templates
        Object.defineProperty(this, "_internalTemplates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Default themes which can be overridden by the user's themes
        Object.defineProperty(this, "_defaultThemes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Disposers for all of the templates
        Object.defineProperty(this, "_templateDisposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Whether the template setup function should be run
        Object.defineProperty(this, "_runSetup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_disposerProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        if (!isReal) {
            throw new Error("You cannot use `new Class()`, instead use `Class.new()`");
        }
        this._root = root;
        this._internalTemplates = templates;
        if (settings.id) {
            this._registerId(settings.id);
        }
    }
    /**
     * Use this method to create an instance of this class.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/#New_element_syntax} for more info
     * @param   root      Root element
     * @param   settings  Settings
     * @param   template  Template
     * @return            Instantiated object
     */
    static new(root, settings, template) {
        const x = (new this(root, settings, true));
        x._template = template;
        x._afterNew();
        return x;
    }
    static _new(root, settings, templates = []) {
        const x = (new this(root, settings, true, templates));
        x._afterNew();
        return x;
    }
    _afterNew() {
        this._checkDirty();
        let shouldApply = false;
        const template = this._template;
        if (template) {
            shouldApply = true;
            template._setObjectTemplate(this);
        }
        each$1(this._internalTemplates, (template) => {
            shouldApply = true;
            template._setObjectTemplate(this);
        });
        if (shouldApply) {
            this._applyTemplates(false);
        }
        this.states.create("default", {});
        this._setDefaults();
    }
    // This is the same as _afterNew, except it also applies the themes.
    // This should only be used for classes which don't have a parent (because they extend from Entity and not Sprite).
    _afterNewApplyThemes() {
        this._checkDirty();
        const template = this._template;
        if (template) {
            template._setObjectTemplate(this);
        }
        each$1(this._internalTemplates, (template) => {
            template._setObjectTemplate(this);
        });
        this.states.create("default", {});
        this._setDefaults();
        this._applyThemes();
    }
    _createEvents() {
        return new EventDispatcher();
    }
    /**
     * @ignore
     */
    get classNames() {
        return this.constructor.classNames;
    }
    /**
     * @ignore
     */
    get className() {
        return this.constructor.className;
    }
    _setDefaults() {
    }
    _setDefaultFn(key, f) {
        const value = this.get(key);
        if (value) {
            return value;
        }
        else {
            const value = f();
            this.set(key, value);
            return value;
        }
    }
    _setDefault(key, value) {
        if (!this.has(key)) {
            super.set(key, value);
        }
    }
    _setRawDefault(key, value) {
        if (!this.has(key)) {
            super.setRaw(key, value);
        }
    }
    _clearDirty() {
        keys(this._dirty).forEach((key) => {
            this._dirty[key] = false;
        });
        keys(this._dirtyPrivate).forEach((key) => {
            this._dirtyPrivate[key] = false;
        });
    }
    /**
     * @ignore
     */
    isDirty(key) {
        return !!this._dirty[key];
    }
    /**
     * @ignore
     */
    isPrivateDirty(key) {
        return !!this._dirtyPrivate[key];
    }
    _markDirtyKey(key) {
        this._dirty[key] = true;
        super._markDirtyKey(key);
    }
    _markDirtyPrivateKey(key) {
        this._dirtyPrivate[key] = true;
        super._markDirtyKey(key);
    }
    /**
     * Checks if element is of certain class (or inherits one).
     *
     * @param   type  Class name to check
     * @return {boolean} Is of class?
     */
    isType(type) {
        return this.classNames.indexOf(type) !== -1;
    }
    _pushPropertyDisposer(key, disposer) {
        let disposers = this._disposerProperties[key];
        if (disposers === undefined) {
            disposers = this._disposerProperties[key] = [];
        }
        disposers.push(disposer);
        return disposer;
    }
    _disposeProperty(key) {
        const disposers = this._disposerProperties[key];
        if (disposers !== undefined) {
            each$1(disposers, (disposer) => {
                disposer.dispose();
            });
            delete this._disposerProperties[key];
        }
    }
    /**
     * @todo needs description
     * @param  value  Template
     */
    set template(value) {
        const template = this._template;
        if (template !== value) {
            this._template = value;
            if (template) {
                template._removeObjectTemplate(this);
            }
            if (value) {
                value._setObjectTemplate(this);
            }
            this._applyTemplates();
        }
    }
    get template() {
        return this._template;
    }
    /**
     * @ignore
     */
    markDirty() {
        this._root._addDirtyEntity(this);
    }
    _startAnimation() {
        this._root._addAnimation(this);
    }
    _animationTime() {
        return this._root.animationTime;
    }
    _applyState(_name) { }
    _applyStateAnimated(_name, _duration) { }
    get(key, fallback) {
        const value = this.adapters.fold(key, this._settings[key]);
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    /**
     * @ignore
     */
    isUserSetting(key) {
        return this._userProperties[key] || false;
    }
    /**
     * Sets a setting `value` for the specified `key`, and returns the same `value`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     * @param   value     Setting value
     * @return            Setting value
     */
    set(key, value) {
        this._userProperties[key] = true;
        return super.set(key, value);
    }
    /**
     * @ignore
     */
    setRaw(key, value) {
        this._userProperties[key] = true;
        super.setRaw(key, value);
    }
    /**
     * Sets a setting `value` for the specified `key` only if the value for this key was not set previously using set method, and returns the same `value`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     * @param   value     Setting value
     * @return            Setting value
     */
    _setSoft(key, value) {
        if (!this._userProperties[key]) {
            return super.set(key, value);
        }
        return value;
    }
    /**
     * Removes a setting value for the specified `key`.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/settings/} for more info
     * @param   key       Setting key
     */
    remove(key) {
        delete this._userProperties[key];
        this._removeTemplateProperty(key);
    }
    /**
     * @ignore
     */
    setPrivate(key, value) {
        this._userPrivateProperties[key] = true;
        return super.setPrivate(key, value);
    }
    /**
     * @ignore
     */
    setPrivateRaw(key, value) {
        this._userPrivateProperties[key] = true;
        super.setPrivateRaw(key, value);
    }
    /**
     * @ignore
     */
    removePrivate(key) {
        delete this._userPrivateProperties[key];
        this._removeTemplatePrivateProperty(key);
    }
    _setTemplateProperty(template, key, value) {
        if (!this._userProperties[key]) {
            const match = this._findTemplateByKey(key);
            if (template === match) {
                super.set(key, value);
            }
        }
    }
    _setTemplatePrivateProperty(template, key, value) {
        if (!this._userPrivateProperties[key]) {
            const match = this._findTemplateByPrivateKey(key);
            if (template === match) {
                super.setPrivate(key, value);
            }
        }
    }
    _removeTemplateProperty(key) {
        if (!this._userProperties[key]) {
            const match = this._findTemplateByKey(key);
            if (match) {
                // TODO don't stop the animation if the property didn't change
                super.set(key, match._settings[key]);
            }
            else {
                super.remove(key);
            }
        }
    }
    _removeTemplatePrivateProperty(key) {
        if (!this._userPrivateProperties[key]) {
            const match = this._findTemplateByPrivateKey(key);
            if (match) {
                // TODO don't stop the animation if the property didn't change
                super.setPrivate(key, match._privateSettings[key]);
            }
            else {
                super.removePrivate(key);
            }
        }
    }
    _walkParents(f) {
        f(this._root._rootContainer);
        f(this);
    }
    // TODO faster version of this method which is specialized to just 1 key
    _applyStateByKey(name) {
        const other = this.states.create(name, {});
        const seen = {};
        this._eachTemplate((template) => {
            const state = template.states.lookup(name);
            if (state) {
                state._apply(other, seen);
            }
        });
        each(other._settings, (key) => {
            if (!seen[key] && !other._userSettings[key]) {
                other.remove(key);
            }
        });
    }
    _applyTemplate(template, state) {
        this._templateDisposers.push(template._apply(this, state));
        each(template._settings, (key, value) => {
            if (!state.settings[key] && !this._userProperties[key]) {
                state.settings[key] = true;
                super.set(key, value);
            }
        });
        each(template._privateSettings, (key, value) => {
            if (!state.privateSettings[key] && !this._userPrivateProperties[key]) {
                state.privateSettings[key] = true;
                super.setPrivate(key, value);
            }
        });
        if (this._runSetup && template.setup) {
            this._runSetup = false;
            template.setup(this);
        }
    }
    /**
     * Calls the closure with each template and returns the first template which is true
     */
    _findStaticTemplate(f) {
        if (this._template) {
            if (f(this._template)) {
                return this._template;
            }
        }
    }
    _eachTemplate(f) {
        this._findStaticTemplate((template) => {
            f(template);
            return false;
        });
        // _internalTemplates is sorted with most specific to the right
        eachReverse(this._internalTemplates, f);
        // _templates is sorted with most specific to the left
        each$1(this._templates, f);
    }
    _applyTemplates(remove = true) {
        if (remove) {
            this._disposeTemplates();
        }
        const state = {
            settings: {},
            privateSettings: {},
            states: {},
        };
        this._eachTemplate((template) => {
            this._applyTemplate(template, state);
        });
        if (remove) {
            each(this._settings, (key) => {
                if (!this._userProperties[key] && !state.settings[key]) {
                    super.remove(key);
                }
            });
            each(this._privateSettings, (key) => {
                if (!this._userPrivateProperties[key] && !state.privateSettings[key]) {
                    super.removePrivate(key);
                }
            });
        }
    }
    _findTemplate(f) {
        const value = this._findStaticTemplate(f);
        if (value === undefined) {
            // _internalTemplates is sorted with most specific to the right
            const value = findReverse(this._internalTemplates, f);
            if (value === undefined) {
                // _templates is sorted with most specific to the left
                return find(this._templates, f);
            }
            else {
                return value;
            }
        }
        else {
            return value;
        }
    }
    _findTemplateByKey(key) {
        return this._findTemplate((template) => {
            return key in template._settings;
        });
    }
    _findTemplateByPrivateKey(key) {
        return this._findTemplate((template) => {
            return key in template._privateSettings;
        });
    }
    _disposeTemplates() {
        each$1(this._templateDisposers, (disposer) => {
            disposer.dispose();
        });
        this._templateDisposers.length = 0;
    }
    _removeTemplates() {
        each$1(this._templates, (template) => {
            template._removeObjectTemplate(this);
        });
        this._templates.length = 0;
    }
    _applyThemes(force = false) {
        let isConnected = false;
        const defaults = [];
        let themes = [];
        const themeTags = new Set();
        const tags = this.get("themeTagsSelf");
        if (tags) {
            each$1(tags, (tag) => {
                themeTags.add(tag);
            });
        }
        this._walkParents((entity) => {
            if (entity === this._root._rootContainer) {
                isConnected = true;
            }
            if (entity._defaultThemes.length > 0) {
                defaults.push(entity._defaultThemes);
            }
            const theme = entity.get("themes");
            if (theme) {
                themes.push(theme);
            }
            const tags = entity.get("themeTags");
            if (tags) {
                each$1(tags, (tag) => {
                    themeTags.add(tag);
                });
            }
        });
        themes = defaults.concat(themes);
        this._removeTemplates();
        if (isConnected || force) {
            eachReverse(this.classNames, (name) => {
                const allRules = [];
                each$1(themes, (themes) => {
                    each$1(themes, (theme) => {
                        const rules = theme._lookupRules(name);
                        if (rules) {
                            eachReverse(rules, (rule) => {
                                const matches = rule.tags.every((tag) => {
                                    return themeTags.has(tag);
                                });
                                if (matches) {
                                    const result = getFirstSortedIndex(allRules, (x) => {
                                        const order = compare(rule.tags.length, x.tags.length);
                                        if (order === 0) {
                                            return compareArray(rule.tags, x.tags, compare);
                                        }
                                        else {
                                            return order;
                                        }
                                    });
                                    allRules.splice(result.index, 0, rule);
                                }
                            });
                        }
                    });
                });
                each$1(allRules, (rule) => {
                    this._templates.push(rule.template);
                    rule.template._setObjectTemplate(this);
                });
            });
        }
        this._applyTemplates();
        if (isConnected || force) {
            // This causes it to only run the setup function the first time that the themes are applied
            this._runSetup = false;
        }
        return isConnected || force;
    }
    _changed() { }
    _beforeChanged() {
        if (this.isDirty("id")) {
            const id = this.get("id");
            if (id) {
                this._registerId(id);
            }
            const prevId = this._prevSettings.id;
            if (prevId) {
                delete this._root.entitiesById[prevId];
                delete registry.entitiesById[prevId];
            }
        }
    }
    _registerId(id) {
        if (this._root.entitiesById[id] && this._root.entitiesById[id] !== this) {
            throw new Error("An entity with id \"" + id + "\" already exists.");
        }
        this._root.entitiesById[id] = this;
        registry.entitiesById[id] = this;
    }
    _afterChanged() { }
    /**
     * @ignore
     */
    addDisposer(disposer) {
        this._disposers.push(disposer);
        return disposer;
    }
    _dispose() {
        super._dispose();
        const template = this._template;
        if (template) {
            template._removeObjectTemplate(this);
        }
        each$1(this._internalTemplates, (template) => {
            template._removeObjectTemplate(this);
        });
        this._removeTemplates();
        this._disposeTemplates();
        this.events.dispose();
        this._disposers.forEach((x) => {
            x.dispose();
        });
        each(this._disposerProperties, (_, disposers) => {
            each$1(disposers, (disposer) => {
                disposer.dispose();
            });
        });
        const id = this.get("id");
        if (id) {
            delete this._root.entitiesById[id];
            delete registry.entitiesById[id];
        }
    }
    /**
     * Creates and returns a "disposable" timeout.
     *
     * @param   fn     Callback
     * @param   delay  Delay in milliseconds
     * @return         Timeout disposer
     */
    setTimeout(fn, delay) {
        const id = setTimeout(() => {
            this.removeDispose(disposer);
            fn();
        }, delay);
        const disposer = new Disposer(() => {
            clearTimeout(id);
        });
        this._disposers.push(disposer);
        return disposer;
    }
    /**
     * @ignore
     */
    removeDispose(target) {
        if (!this.isDisposed()) {
            let index = indexOf(this._disposers, target);
            if (index > -1) {
                this._disposers.splice(index, 1);
            }
        }
        target.dispose();
    }
    /**
     * @ignore
     */
    hasTag(tag) {
        return indexOf(this.get("themeTags", []), tag) !== -1;
    }
    /**
     * @ignore
     */
    addTag(tag) {
        if (!this.hasTag(tag)) {
            const tags = this.get("themeTags", []);
            tags.push(tag);
            this.set("themeTags", tags);
        }
    }
    /**
     * @ignore
     */
    removeTag(tag) {
        if (this.hasTag(tag)) {
            const tags = this.get("themeTags", []);
            remove(tags, tag);
            this.set("themeTags", tags);
        }
    }
    _t(text, locale, ...rest) {
        return this._root.language.translate(text, locale, ...rest);
    }
    /**
     * An instance of [[Root]] object.
     *
     * @readonly
     * @since 5.0.6
     * @return Root object
     */
    get root() {
        return this._root;
    }
}
Object.defineProperty(Entity, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Entity"
});
Object.defineProperty(Entity, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: ["Entity"]
});

function disposeSettings(settings) {
    each(settings, (_key, value) => {
        if (isObject(value) && typeof value.dispose === "function") {
            value.enableDispose = true;
            value.dispose();
        }
    });
}
class TemplateState {
    constructor(name, template, settings) {
        Object.defineProperty(this, "_settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._name = name;
        this._template = template;
        this._settings = settings;
    }
    _dispose() {
        disposeSettings(this._settings);
    }
    get(key, fallback) {
        const value = this._settings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    set(key, value) {
        this._settings[key] = value;
        // TODO maybe only do this if the value changed ?
        this._template._stateChanged(this._name);
    }
    remove(key) {
        delete this._settings[key];
        // TODO maybe only do this if the value changed ?
        this._template._stateChanged(this._name);
    }
    setAll(settings) {
        keys(settings).forEach((key) => {
            this._settings[key] = settings[key];
        });
        this._template._stateChanged(this._name);
    }
    _apply(other, seen) {
        each(this._settings, (key, value) => {
            if (!seen[key] && !other._userSettings[key]) {
                seen[key] = true;
                other.setRaw(key, value);
            }
        });
    }
}
class TemplateStates {
    constructor(template) {
        Object.defineProperty(this, "_template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_states", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this._template = template;
    }
    _dispose() {
        each(this._states, (_key, state) => {
            state._dispose();
        });
    }
    lookup(name) {
        return this._states[name];
    }
    create(name, settings) {
        const state = this._states[name];
        if (state) {
            state.setAll(settings);
            return state;
        }
        else {
            const state = new TemplateState(name, this._template, settings);
            this._states[name] = state;
            this._template._stateChanged(name);
            return state;
        }
    }
    remove(name) {
        delete this._states[name];
        this._template._stateChanged(name);
    }
    _apply(entity, state) {
        each(this._states, (key, value) => {
            let seen = state.states[key];
            if (seen == null) {
                seen = state.states[key] = {};
            }
            const other = entity.states.create(key, {});
            value._apply(other, seen);
        });
    }
}
class TemplateAdapters {
    constructor() {
        Object.defineProperty(this, "_callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    add(key, callback) {
        let callbacks = this._callbacks[key];
        if (callbacks === undefined) {
            callbacks = this._callbacks[key] = [];
        }
        callbacks.push(callback);
        return new Disposer(() => {
            removeFirst(callbacks, callback);
            if (callbacks.length === 0) {
                delete this._callbacks[key];
            }
        });
    }
    remove(key) {
        const callbacks = this._callbacks[key];
        if (callbacks !== undefined) {
            delete this._callbacks[key];
        }
    }
    _apply(entity) {
        const disposers = [];
        each(this._callbacks, (key, callbacks) => {
            each$1(callbacks, (callback) => {
                disposers.push(entity.adapters.add(key, callback));
            });
        });
        return new MultiDisposer(disposers);
    }
}
// TODO maybe extend from Properties ?
class Template {
    constructor(settings, isReal) {
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_privateSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        // TODO code duplication with Properties
        Object.defineProperty(this, "_settingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_privateSettingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "states", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new TemplateStates(this)
        });
        Object.defineProperty(this, "adapters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new TemplateAdapters()
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventDispatcher()
        });
        Object.defineProperty(this, "setup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!isReal) {
            throw new Error("You cannot use `new Class()`, instead use `Class.new()`");
        }
        this._settings = settings;
    }
    /**
     * Use this method to create an instance of this class.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/#New_element_syntax} for more info
     * @param   root      Root element
     * @param   settings  Settings
     * @param   template  Template
     * @return            Instantiated object
     */
    static new(settings) {
        return new Template(settings, true);
    }
    _dispose() {
        disposeSettings(this._settings);
        disposeSettings(this._privateSettings);
    }
    /**
     * Returns `true` if this element is disposed.
     *
     * @return Disposed
     */
    isDisposed() {
        return this._disposed;
    }
    /**
     * Disposes this object.
     */
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._dispose();
        }
    }
    _checkDisposed() {
        if (this._disposed) {
            throw new Error("Template is disposed");
        }
    }
    /**
     * Array of all entities using this template.
     */
    get entities() {
        return this._entities;
    }
    get(key, fallback) {
        this._checkDisposed();
        const value = this._settings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    setRaw(key, value) {
        this._checkDisposed();
        this._settings[key] = value;
    }
    set(key, value) {
        this._checkDisposed();
        if (this._settings[key] !== value) {
            this.setRaw(key, value);
            this._entities.forEach((entity) => {
                entity._setTemplateProperty(this, key, value);
            });
        }
    }
    remove(key) {
        this._checkDisposed();
        if (key in this._settings) {
            delete this._settings[key];
            this._entities.forEach((entity) => {
                entity._removeTemplateProperty(key);
            });
        }
    }
    removeAll() {
        this._checkDisposed();
        each(this._settings, (key, _value) => {
            this.remove(key);
        });
    }
    getPrivate(key, fallback) {
        this._checkDisposed();
        const value = this._privateSettings[key];
        if (value !== undefined) {
            return value;
        }
        else {
            return fallback;
        }
    }
    setPrivateRaw(key, value) {
        this._checkDisposed();
        this._privateSettings[key] = value;
        return value;
    }
    setPrivate(key, value) {
        this._checkDisposed();
        if (this._privateSettings[key] !== value) {
            this.setPrivateRaw(key, value);
            this._entities.forEach((entity) => {
                entity._setTemplatePrivateProperty(this, key, value);
            });
        }
        return value;
    }
    removePrivate(key) {
        this._checkDisposed();
        if (key in this._privateSettings) {
            delete this._privateSettings[key];
            this._entities.forEach((entity) => {
                entity._removeTemplatePrivateProperty(key);
            });
        }
    }
    setAll(value) {
        this._checkDisposed();
        each(value, (key, value) => {
            this.set(key, value);
        });
    }
    // TODO code duplication with Properties
    on(key, callback) {
        this._checkDisposed();
        let events = this._settingEvents[key];
        if (events === undefined) {
            events = this._settingEvents[key] = [];
        }
        events.push(callback);
        return new Disposer(() => {
            removeFirst(events, callback);
            if (events.length === 0) {
                delete this._settingEvents[key];
            }
        });
    }
    // TODO code duplication with Properties
    onPrivate(key, callback) {
        this._checkDisposed();
        let events = this._privateSettingEvents[key];
        if (events === undefined) {
            events = this._privateSettingEvents[key] = [];
        }
        events.push(callback);
        return new Disposer(() => {
            removeFirst(events, callback);
            if (events.length === 0) {
                delete this._privateSettingEvents[key];
            }
        });
    }
    _apply(entity, state) {
        this._checkDisposed();
        const disposers = [];
        each(this._settingEvents, (key, events) => {
            each$1(events, (event) => {
                disposers.push(entity.on(key, event));
            });
        });
        each(this._privateSettingEvents, (key, events) => {
            each$1(events, (event) => {
                disposers.push(entity.onPrivate(key, event));
            });
        });
        this.states._apply(entity, state);
        disposers.push(this.adapters._apply(entity));
        disposers.push(entity.events.copyFrom(this.events));
        return new MultiDisposer(disposers);
    }
    _setObjectTemplate(entity) {
        this._checkDisposed();
        this._entities.push(entity);
    }
    _removeObjectTemplate(entity) {
        //this._checkDisposed();
        remove(this._entities, entity);
    }
    _stateChanged(name) {
        this._checkDisposed();
        this._entities.forEach((entity) => {
            entity._applyStateByKey(name);
        });
    }
}

//import { populateString } from "../util/PopulateString";
/**
 * An [[EventDispatcher]] for [[Sprite]].
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/events/} for more info
 */
class SpriteEventDispatcher extends EventDispatcher {
    constructor(sprite) {
        super();
        Object.defineProperty(this, "_sprite", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rendererDisposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dispatchParents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this._sprite = sprite;
    }
    _makePointerEvent(key, event) {
        return {
            type: key,
            originalEvent: event.event,
            point: event.point,
            simulated: event.simulated,
            native: event.native,
            target: this._sprite
        };
    }
    _onRenderer(key, dispatch) {
        // TODO: is this OK? it'd be good not to require to set this on each individual element
        this._sprite.set("interactive", true);
        this._sprite._display.interactive = true;
        let events = this._rendererDisposers[key];
        if (events === undefined) {
            const disposer = this._sprite._display.on(key, (e) => {
                dispatch.call(this, e);
            });
            events = this._rendererDisposers[key] = new CounterDisposer(() => {
                delete this._rendererDisposers[key];
                disposer.dispose();
            });
        }
        return events.increment();
    }
    _on(once, type, callback, context, shouldClone, dispatch, debounceDelay) {
        const info = super._on(once, type, callback, context, shouldClone, dispatch, debounceDelay);
        const rendererEvent = SpriteEventDispatcher.RENDERER_EVENTS[type];
        if (rendererEvent !== undefined) {
            info.disposer = new MultiDisposer([
                info.disposer,
                this._onRenderer(type, rendererEvent),
            ]);
        }
        return info;
    }
    /**
     * Will stop any bubbling up of the event to element's parents.
     *
     * Should be called in an event handler, e.g.:
     *
     * ```TypeScript
     * element.events.on("pointerdown", function(ev) {
     *   // Do something here and prevent from "pointerdown" bubbling up
     *   // ...
     *   ev.target.events.stopParentDispatch();
     * });
     * ```
     * ```JavaScript
     * element.events.on("pointerdown", function(ev) {
     *   // Do something here and prevent from "pointerdown" bubbling up
     *   // ...
     *   ev.target.events.stopParentDispatch();
     * });
     * ```
     */
    stopParentDispatch() {
        this._dispatchParents = false;
    }
    /**
     * @ignore
     */
    dispatchParents(type, event) {
        const old = this._dispatchParents;
        this._dispatchParents = true;
        try {
            this.dispatch(type, event);
            if (this._dispatchParents && this._sprite.parent) {
                this._sprite.parent.events.dispatchParents(type, event);
            }
        }
        finally {
            this._dispatchParents = old;
        }
    }
}
Object.defineProperty(SpriteEventDispatcher, "RENDERER_EVENTS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        "click": function (event) {
            if (this.isEnabled("click") && !this._sprite.isDragging() && this._sprite._hasDown() && !this._sprite._hasMoved(this._makePointerEvent("click", event))) {
                this.dispatch("click", this._makePointerEvent("click", event));
            }
        },
        "rightclick": function (event) {
            if (this.isEnabled("rightclick")) {
                this.dispatch("rightclick", this._makePointerEvent("rightclick", event));
            }
        },
        "middleclick": function (event) {
            if (this.isEnabled("middleclick")) {
                this.dispatch("middleclick", this._makePointerEvent("middleclick", event));
            }
        },
        "dblclick": function (event) {
            this.dispatchParents("dblclick", this._makePointerEvent("dblclick", event));
        },
        "pointerover": function (event) {
            const sprite = this._sprite;
            let dispatch = true;
            if (sprite.getPrivate("trustBounds")) {
                sprite._getBounds();
                const bounds = sprite.globalBounds();
                if (sprite.isType("Graphics")) {
                    const strokeWidth = sprite.get("strokeWidth", 1) / 2;
                    if (strokeWidth >= 1) {
                        bounds.left -= strokeWidth;
                        bounds.right += strokeWidth;
                        bounds.top -= strokeWidth;
                        bounds.bottom += strokeWidth;
                    }
                }
                if (!inBounds(event.point, bounds)) {
                    dispatch = false;
                    sprite._root._renderer.removeHovering(sprite._display);
                }
            }
            if (dispatch && this.isEnabled("pointerover")) {
                this.dispatch("pointerover", this._makePointerEvent("pointerover", event));
            }
        },
        "pointerout": function (event) {
            if (this.isEnabled("pointerout")) {
                this.dispatch("pointerout", this._makePointerEvent("pointerout", event));
            }
        },
        "pointerdown": function (event) {
            this.dispatchParents("pointerdown", this._makePointerEvent("pointerdown", event));
        },
        "pointerup": function (event) {
            if (this.isEnabled("pointerup")) {
                this.dispatch("pointerup", this._makePointerEvent("pointerup", event));
            }
        },
        "globalpointerup": function (event) {
            if (this.isEnabled("globalpointerup")) {
                this.dispatch("globalpointerup", this._makePointerEvent("globalpointerup", event));
            }
        },
        "globalpointermove": function (event) {
            if (this.isEnabled("globalpointermove")) {
                this.dispatch("globalpointermove", this._makePointerEvent("globalpointermove", event));
            }
        },
        "wheel": function (event) {
            this.dispatchParents("wheel", {
                type: "wheel",
                target: this._sprite,
                originalEvent: event.event,
                point: event.point,
            });
        },
    }
});
/**
 * A base class for all visual elements.
 *
 * @important
 */
class Sprite extends Entity {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_adjustedLocalBounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { left: 0, right: 0, top: 0, bottom: 0 }
        });
        Object.defineProperty(this, "_localBounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { left: 0, right: 0, top: 0, bottom: 0 }
        });
        Object.defineProperty(this, "_parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dataItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_templateField", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_sizeDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // Will be true only when dragging
        Object.defineProperty(this, "_isDragging", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // The event when the dragging starts
        Object.defineProperty(this, "_dragEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // The position when dragging starts
        Object.defineProperty(this, "_dragPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isHidden", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isShowing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isHiding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isDown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_downPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_downPoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_toggleDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dragDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_hoverDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_focusDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipMoveDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipPointerDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        //protected _statesHandled: boolean = false;
        Object.defineProperty(this, "_virtualParent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    _afterNew() {
        this.setPrivateRaw("visible", true);
        super._afterNew();
    }
    /**
     * Marks some setting as dirty. Could be used to trigger adapter.
     * @param key
     */
    markDirtyKey(key) {
        this._markDirtyKey(key);
    }
    _markDirtyKey(key) {
        super._markDirtyKey(key);
        if (key == "x" || key == "y" || key == "dx" || key == "dy") {
            this.markDirtyBounds();
            this._addPercentagePositionChildren();
            this.markDirtyPosition();
        }
    }
    _markDirtyPrivateKey(key) {
        super._markDirtyPrivateKey(key);
        if (key == "x" || key == "y") {
            this.markDirtyPosition();
        }
    }
    _removeTemplateField() {
        if (this._templateField) {
            this._templateField._removeObjectTemplate(this);
        }
    }
    _createEvents() {
        return new SpriteEventDispatcher(this);
    }
    _processTemplateField() {
        let template;
        const field = this.get("templateField");
        if (field) {
            const dataItem = this.dataItem;
            if (dataItem) {
                const context = dataItem.dataContext;
                if (context) {
                    template = context[field];
                    if (!(template instanceof Template) && template) {
                        template = Template.new(template);
                    }
                }
            }
        }
        if (this._templateField !== template) {
            this._removeTemplateField();
            this._templateField = template;
            if (template) {
                template._setObjectTemplate(this);
            }
            this._applyTemplates();
        }
    }
    // TODO change this to run before the element is added to the parent, so that way
    //      it doesn't need to apply the themes twice
    _setDataItem(dataItem) {
        const oldDataItem = this._dataItem;
        this._dataItem = dataItem;
        this._processTemplateField();
        const eventType = "dataitemchanged";
        if (dataItem != oldDataItem) {
            if (this.events.isEnabled(eventType)) {
                this.events.dispatch(eventType, {
                    type: eventType,
                    target: this,
                    oldDataItem: oldDataItem,
                    newDataItem: dataItem
                });
            }
        }
    }
    /**
     * A [[DataItem]] used for this element.
     *
     * NOTE: data item is being assigned automatically in most cases where it
     * matters. Use this accessor to set data item only if you know what you're
     * doing.
     *
     * @param  value  Data item
     */
    set dataItem(value) {
        this._setDataItem(value);
    }
    /**
     * @return DataItem
     */
    get dataItem() {
        if (this._dataItem) {
            return this._dataItem;
        }
        else {
            let parent = this._parent;
            while (parent) {
                if (parent._dataItem) {
                    return parent._dataItem;
                }
                else {
                    parent = parent._parent;
                }
            }
        }
    }
    _addPercentageSizeChildren() {
        let parent = this.parent;
        if (parent) {
            if (this.get("width") instanceof Percent || this.get("height") instanceof Percent) {
                pushOne(parent._percentageSizeChildren, this);
            }
            else {
                removeFirst(parent._percentageSizeChildren, this);
            }
        }
    }
    _addPercentagePositionChildren() {
        let parent = this.parent;
        if (parent) {
            if (this.get("x") instanceof Percent || this.get("y") instanceof Percent) {
                pushOne(parent._percentagePositionChildren, this);
            }
            else {
                removeFirst(parent._percentagePositionChildren, this);
            }
        }
    }
    /**
     * @ignore
     */
    markDirtyPosition() {
        this._root._addDirtyPosition(this);
    }
    updatePivotPoint() {
        const bounds = this._localBounds;
        if (bounds) {
            const centerX = this.get("centerX");
            if (centerX != null) {
                this._display.pivot.x = bounds.left + relativeToValue(centerX, bounds.right - bounds.left);
            }
            const centerY = this.get("centerY");
            if (centerY != null) {
                this._display.pivot.y = bounds.top + relativeToValue(centerY, bounds.bottom - bounds.top);
            }
        }
    }
    _beforeChanged() {
        super._beforeChanged();
        // handling states in beforeChanged, otherwise states is not applied without animated theme
        this._handleStates();
        if (this.isDirty("tooltip")) {
            const previous = this._prevSettings.tooltip;
            if (previous) {
                previous.dispose();
            }
        }
        if (this.isDirty("layer") || this.isDirty("layerMargin")) {
            this._display.setLayer(this.get("layer"), this.get("layerMargin"));
            this.markDirtyLayer();
        }
        if (this.isDirty("tooltipPosition")) {
            const tooltipMoveDp = this._tooltipMoveDp;
            if (tooltipMoveDp) {
                tooltipMoveDp.dispose();
                this._tooltipMoveDp = undefined;
            }
            const tooltipPointerDp = this._tooltipPointerDp;
            if (tooltipPointerDp) {
                tooltipPointerDp.dispose();
                this._tooltipPointerDp = undefined;
            }
            if (this.get("tooltipPosition") == "pointer") {
                if (this.isHover()) {
                    this._tooltipMoveDp = this.events.on("globalpointermove", (e) => {
                        this.showTooltip(e.point);
                    });
                }
                this._tooltipPointerDp = new MultiDisposer([
                    this.events.on("pointerover", () => {
                        this._tooltipMoveDp = this.events.on("globalpointermove", (e) => {
                            this.showTooltip(e.point);
                        });
                    }),
                    this.events.on("pointerout", () => {
                        const tooltipMoveDp = this._tooltipMoveDp;
                        if (tooltipMoveDp) {
                            tooltipMoveDp.dispose();
                            this._tooltipMoveDp = undefined;
                        }
                    })
                ]);
            }
        }
    }
    _handleStates() {
        //if (!this._statesHandled) {
        if (this.isDirty("active")) {
            if (this.get("active")) {
                this.states.applyAnimate("active");
                this.set("ariaChecked", true);
            }
            else {
                if (!this.isHidden()) {
                    this.states.applyAnimate("default");
                }
                this.set("ariaChecked", false);
            }
            this.markDirtyAccessibility();
        }
        if (this.isDirty("disabled")) {
            if (this.get("disabled")) {
                this.states.applyAnimate("disabled");
                this.set("ariaChecked", false);
            }
            else {
                if (!this.isHidden()) {
                    this.states.applyAnimate("default");
                }
                this.set("ariaChecked", true);
            }
            this.markDirtyAccessibility();
        }
        //	this._statesHandled = true;
        //}
    }
    _changed() {
        super._changed();
        const display = this._display;
        const events = this.events;
        if (this.isDirty("draggable")) {
            const draggable = this.get("draggable");
            if (draggable) {
                this.set("interactive", true);
                this._dragDp = new MultiDisposer([
                    events.on("pointerdown", (ev) => {
                        this.dragStart(ev);
                    }),
                    events.on("globalpointermove", (ev) => {
                        this.dragMove(ev);
                    }),
                    events.on("globalpointerup", (ev) => {
                        this.dragStop(ev);
                    })
                ]);
            }
            else {
                if (this._dragDp) {
                    this._dragDp.dispose();
                    this._dragDp = undefined;
                }
            }
            display.cancelTouch = draggable ? true : false;
        }
        if (this.isDirty("tooltipText") || this.isDirty("tooltipHTML") || this.isDirty("showTooltipOn")) {
            const tooltipText = this.get("tooltipText");
            const tooltipHTML = this.get("tooltipHTML");
            const showTooltipOn = this.get("showTooltipOn", "hover");
            if (this._tooltipDp) {
                this._tooltipDp.dispose();
                this._tooltipDp = undefined;
            }
            if (tooltipText || tooltipHTML) {
                if (showTooltipOn == "click") {
                    this._tooltipDp = new MultiDisposer([
                        events.on("click", () => {
                            this.setTimeout(() => {
                                const tooltip = this.getTooltip();
                                if (tooltip && !tooltip.isHidden() && tooltip.get("tooltipTarget") === this) {
                                    this.hideTooltip();
                                }
                                else {
                                    this.showTooltip();
                                }
                            }, 10);
                        }),
                        addEventListener(document, "click", (_ev) => {
                            this.hideTooltip();
                        })
                    ]);
                    this._disposers.push(this._tooltipDp);
                }
                else if (showTooltipOn == "always") ;
                else {
                    this._tooltipDp = new MultiDisposer([
                        events.on("pointerover", () => {
                            this.showTooltip();
                        }),
                        events.on("pointerout", () => {
                            this.hideTooltip();
                        })
                    ]);
                    this._disposers.push(this._tooltipDp);
                }
            }
        }
        if (this.isDirty("toggleKey")) {
            let toggleKey = this.get("toggleKey");
            if (toggleKey && toggleKey != "none") {
                this._toggleDp = events.on("click", () => {
                    if (!this._isDragging) {
                        this.set(toggleKey, !this.get(toggleKey));
                    }
                });
            }
            else {
                if (this._toggleDp) {
                    this._toggleDp.dispose();
                    this._toggleDp = undefined;
                }
            }
        }
        if (this.isDirty("opacity")) {
            display.alpha = Math.max(0, this.get("opacity", 1));
            if (this.get("focusable")) {
                this.markDirtyAccessibility();
            }
        }
        if (this.isDirty("rotation")) {
            this.markDirtyBounds();
            display.angle = this.get("rotation", 0);
        }
        if (this.isDirty("scale")) {
            this.markDirtyBounds();
            display.scale = this.get("scale", 0);
        }
        if (this.isDirty("centerX") || this.isDirty("centerY")) {
            this.markDirtyBounds();
            this.updatePivotPoint();
        }
        if (this.isDirty("visible") || this.isPrivateDirty("visible") || this.isDirty("forceHidden")) {
            if (!this.get("visible") || !this.getPrivate("visible") || this.get("forceHidden")) {
                display.visible = false;
                this.hideTooltip();
            }
            else {
                display.visible = true;
            }
            this.markDirtyBounds();
            if (this.get("focusable")) {
                this.markDirtyAccessibility();
            }
        }
        if (this.isDirty("width") || this.isDirty("height")) {
            this.markDirtyBounds();
            this._addPercentageSizeChildren();
            const parent = this.parent;
            if (parent) {
                if ((this.isDirty("width") && this.get("width") instanceof Percent) || (this.isDirty("height") && this.get("height") instanceof Percent)) {
                    parent.markDirty();
                    parent._prevWidth = 0;
                }
            }
            this._sizeDirty = true;
        }
        if (this.isDirty("maxWidth") || this.isDirty("maxHeight") || this.isPrivateDirty("width") || this.isPrivateDirty("height") || this.isDirty("minWidth") || this.isDirty("minHeight") || this.isPrivateDirty("maxWidth") || this.isPrivateDirty("maxHeight") || this.isPrivateDirty("minWidth") || this.isPrivateDirty("minHeight") || this.isDirty("marginLeft") || this.isDirty("marginTop") || this.isDirty("marginRight") || this.isDirty("marginBottom")) {
            this.markDirtyBounds();
            this._sizeDirty = true;
        }
        if (this._sizeDirty) {
            this._updateSize();
        }
        if (this.isDirty("wheelable")) {
            const wheelable = this.get("wheelable");
            if (wheelable) {
                this.set("interactive", true);
            }
            display.wheelable = wheelable ? true : false;
        }
        // Accessibility
        if (this.isDirty("tabindexOrder") || this.isDirty("focusableGroup")) {
            if (this.get("focusable")) {
                this._root._registerTabindexOrder(this);
            }
            else {
                this._root._unregisterTabindexOrder(this);
            }
        }
        if (this.isDirty("filter")) {
            //this.markDirtyBounds();
            display.filter = this.get("filter");
        }
        let filter = this.get("filter", "");
        if (this.isDirty("blur")) {
            const blur = this.get("blur", 0);
            if (blur != 0) {
                filter += " blur(" + blur + "px)";
            }
        }
        if (this.isDirty("saturate")) {
            const saturate = this.get("saturate", 1);
            if (saturate != 1) {
                filter += " saturate(" + saturate + ")";
            }
        }
        if (this.isDirty("brightness")) {
            const brightness = this.get("brightness", 1);
            if (brightness != 1) {
                filter += " brightness(" + brightness + ")";
            }
        }
        if (this.isDirty("contrast")) {
            const contrast = this.get("contrast", 1);
            if (contrast != 1) {
                filter += " contrast(" + contrast + ")";
            }
        }
        if (this.isDirty("sepia")) {
            const sepia = this.get("sepia", 0);
            if (sepia != 0) {
                filter += " sepia(" + sepia + ")";
            }
        }
        if (this.isDirty("hue")) {
            const hue = this.get("hue", 0);
            if (hue != 0) {
                filter += " hue-rotate(" + hue + "deg)";
            }
        }
        if (this.isDirty("invert")) {
            const invert = this.get("invert", 0);
            if (invert != 0) {
                filter += " invert(" + invert + ")";
            }
        }
        if (filter) {
            display.filter = filter;
        }
        if (this.isDirty("cursorOverStyle")) {
            display.cursorOverStyle = this.get("cursorOverStyle");
        }
        if (this.isDirty("hoverOnFocus")) {
            if (this.get("hoverOnFocus")) {
                this._focusDp = new MultiDisposer([
                    events.on("focus", () => {
                        // TODO: proper hover, not just tooltip
                        this.showTooltip();
                    }),
                    events.on("blur", () => {
                        // TODO: proper hover, not just tooltip
                        this.hideTooltip();
                    })
                ]);
            }
            else {
                if (this._focusDp) {
                    this._focusDp.dispose();
                    this._focusDp = undefined;
                }
            }
        }
        if (this.isDirty("focusable")) {
            if (this.get("focusable")) {
                this._root._registerTabindexOrder(this);
            }
            else {
                this._root._unregisterTabindexOrder(this);
            }
            this.markDirtyAccessibility();
            this._disposers.push(events.on("blur", () => {
                this.setPrivateRaw("touchHovering", false);
            }));
            this._disposers.push(events.once("boundschanged", () => {
                // We might need to do this to re-evaluate accessibility attributes
                // once the element gains size (bounds)
                this.markDirtyAccessibility();
            }));
        }
        if (this.isPrivateDirty("focusable")) {
            this.markDirtyAccessibility();
        }
        if (this.isDirty("role") || this.isDirty("ariaLive") || this.isDirty("ariaChecked") || this.isDirty("ariaHidden") || this.isDirty("ariaOrientation") || this.isDirty("ariaValueNow") || this.isDirty("ariaValueMin") || this.isDirty("ariaValueMax") || this.isDirty("ariaValueText") || this.isDirty("ariaLabel") || this.isDirty("ariaControls")) {
            // display.accessibility.ariaLabel = populateString(this, this.get("ariaLabel", ""));
            // @todo make sure ariaLabel gets populated in Root
            this.markDirtyAccessibility();
        }
        if (this.isDirty("exportable")) {
            display.exportable = this.get("exportable");
        }
        if (this.isDirty("interactive")) {
            const events = this.events;
            if (this.get("interactive") && !events.isDisposed()) {
                this._hoverDp = new MultiDisposer([
                    events.on("click", (ev) => {
                        if (isTouchEvent(ev.originalEvent)) {
                            if (!this.getPrivate("touchHovering")) {
                                this.setTimeout(() => {
                                    this._handleOver();
                                    if (this.get("tooltipText") || this.get("tooltipHTML")) {
                                        this.showTooltip();
                                    }
                                    this.setPrivateRaw("touchHovering", true);
                                    this.events.dispatch("pointerover", {
                                        type: "pointerover",
                                        target: ev.target,
                                        originalEvent: ev.originalEvent,
                                        point: ev.point,
                                        simulated: ev.simulated
                                    });
                                }, 10);
                            }
                        }
                    }),
                    events.on("globalpointerup", (ev) => {
                        if (isTouchEvent(ev.originalEvent)) {
                            if (this.getPrivate("touchHovering")) {
                                this._handleOut();
                                if (this.get("tooltipText") || this.get("tooltipHTML")) {
                                    this.hideTooltip();
                                }
                                this.setPrivateRaw("touchHovering", false);
                                this.events.dispatch("pointerout", {
                                    type: "pointerout",
                                    target: ev.target,
                                    originalEvent: ev.originalEvent,
                                    point: ev.point,
                                    simulated: ev.simulated
                                });
                            }
                        }
                        if (this._isDown) {
                            this._handleUp(ev);
                        }
                        //this._isDown = false;
                    }),
                    events.on("pointerover", () => {
                        this._handleOver();
                    }),
                    events.on("pointerout", () => {
                        this._handleOut();
                    }),
                    events.on("pointerdown", (e) => {
                        this._handleDown(e);
                    })
                ]);
            }
            else {
                this._display.interactive = false;
                if (this._hoverDp) {
                    this._hoverDp.dispose();
                    this._hoverDp = undefined;
                }
            }
        }
        if (this.isDirty("forceInactive")) {
            this._display.inactive = this.get("forceInactive", null);
        }
        if (this.get("showTooltipOn") == "always" && this._display.visible) {
            this.showTooltip();
        }
    }
    /**
     * @ignore
     * @todo should this be user-accessible?
     */
    dragStart(e) {
        this._dragEvent = e;
        this.events.stopParentDispatch();
    }
    /**
     * @ignore
     * @todo should this be user-accessible?
     */
    dragStop(e) {
        this._dragEvent = undefined;
        this._dragPoint = undefined;
        this.events.stopParentDispatch();
        if (this._isDragging) {
            this._isDragging = false;
            const type = "dragstop";
            if (this.events.isEnabled(type)) {
                this.events.dispatch(type, {
                    type: type,
                    target: this,
                    originalEvent: e.originalEvent,
                    point: e.point,
                    simulated: e.simulated,
                });
            }
        }
    }
    _handleOver() {
        if (!this.isHidden()) {
            if (this.get("active") && this.states.lookup("hoverActive")) {
                this.states.applyAnimate("hoverActive");
            }
            else if (this.get("disabled") && this.states.lookup("hoverDisabled")) {
                this.states.applyAnimate("hoverDisabled");
            }
            else {
                this.states.applyAnimate("hover");
            }
            if (this.get("draggable") && this._isDown && this.states.lookup("down")) {
                this.states.applyAnimate("down");
            }
        }
    }
    _handleOut() {
        if (!this.isHidden()) {
            if (this.get("active") && this.states.lookup("active")) {
                this.states.applyAnimate("active");
            }
            else if (this.get("disabled") && this.states.lookup("disabled")) {
                this.states.applyAnimate("disabled");
            }
            else {
                if (this.states.lookup("hover") || this.states.lookup("hoverActive")) {
                    this.states.applyAnimate("default");
                }
            }
            if (this.get("draggable") && this._isDown && this.states.lookup("down")) {
                this.states.applyAnimate("down");
            }
        }
    }
    _handleUp(e) {
        if (!this.isHidden()) {
            if (this.get("active") && this.states.lookup("active")) {
                this.states.applyAnimate("active");
            }
            else if (this.get("disabled") && this.states.lookup("disabled")) {
                this.states.applyAnimate("disabled");
            }
            else if (this.states.lookup("down")) {
                if (this.isHover()) {
                    this.states.applyAnimate("hover");
                }
                else {
                    this.states.applyAnimate("default");
                }
            }
            // @todo remove this once migrated to _downPoints
            this._downPoint = undefined;
            const pointerId = getPointerId(e.originalEvent);
            delete this._downPoints[pointerId];
            if (keys(this._downPoints).length == 0) {
                this._isDown = false;
            }
        }
    }
    _hasMoved(e) {
        // @todo remove this once migrated to _downPoints
        // if (this._downPoint) {
        // 	const x = Math.abs(this._downPoint.x - e.point.x);
        // 	const y = Math.abs(this._downPoint.y - e.point.y);
        // 	return (x > 5) || (y > 5);
        // }
        const pointerId = getPointerId(e.originalEvent);
        const downPoint = this._downPoints[pointerId];
        if (downPoint) {
            const x = Math.abs(downPoint.x - e.point.x);
            const y = Math.abs(downPoint.y - e.point.y);
            return (x > 5) || (y > 5);
        }
        return false;
    }
    _hasDown() {
        return keys(this._downPoints).length > 0;
    }
    _handleDown(e) {
        const parent = this.parent;
        if (parent && !this.get("draggable")) {
            parent._handleDown(e);
        }
        if (this.get("interactive") && !this.isHidden()) {
            if (this.states.lookup("down")) {
                this.states.applyAnimate("down");
            }
            this._downPoint = {
                x: e.point.x,
                y: e.point.y
            };
            // @todo remove this once migrated to _downPoints
            this._isDown = true;
            const pointerId = getPointerId(e.originalEvent);
            this._downPoints[pointerId] = {
                x: e.point.x,
                y: e.point.y
            };
        }
    }
    /**
     * @ignore
     * @todo should this be user-accessible?
     */
    dragMove(e) {
        let dragEvent = this._dragEvent;
        if (dragEvent) {
            if (dragEvent.simulated && !e.simulated) {
                return true;
            }
            let angle = 0;
            let parent = this.parent;
            let scale = 1;
            while (parent != null) {
                angle += parent.get("rotation", 0);
                parent = parent.parent;
                if (parent) {
                    scale *= parent.get("scale", 1);
                }
            }
            let x = (e.point.x - dragEvent.point.x) / scale;
            let y = (e.point.y - dragEvent.point.y) / scale;
            const events = this.events;
            if (dragEvent.simulated && !this._isDragging) {
                this._isDragging = true;
                this._dragEvent = e;
                this._dragPoint = {
                    x: this.x(),
                    y: this.y()
                };
                const type = "dragstart";
                if (events.isEnabled(type)) {
                    events.dispatch(type, {
                        type: type,
                        target: this,
                        originalEvent: e.originalEvent,
                        point: e.point,
                        simulated: e.simulated,
                    });
                }
            }
            if (this._isDragging) {
                let dragPoint = this._dragPoint;
                this.set("x", dragPoint.x + x * cos(angle) + y * sin(angle));
                this.set("y", dragPoint.y + y * cos(angle) - x * sin(angle));
                const type = "dragged";
                if (events.isEnabled(type)) {
                    events.dispatch(type, {
                        type: type,
                        target: this,
                        originalEvent: e.originalEvent,
                        point: e.point,
                        simulated: e.simulated,
                    });
                }
            }
            else {
                if (Math.hypot(x, y) > 5) {
                    this._isDragging = true;
                    this._dragEvent = e;
                    this._dragPoint = {
                        x: this.x(),
                        y: this.y()
                    };
                    const type = "dragstart";
                    if (events.isEnabled(type)) {
                        events.dispatch(type, {
                            type: type,
                            target: this,
                            originalEvent: e.originalEvent,
                            point: e.point,
                            simulated: e.simulated
                        });
                    }
                }
            }
        }
    }
    _updateSize() {
    }
    _getBounds() {
        this._localBounds = this._display.getLocalBounds();
    }
    /**
     * Returns depth (how deep in the hierachy of the content tree) of this
     * element.
     *
     * @return Depth
     */
    depth() {
        let self = this.parent;
        let depth = 0;
        while (true) {
            if (self) {
                ++depth;
                self = self.parent;
            }
            else {
                return depth;
            }
        }
    }
    /**
     * @ignore
     */
    markDirtySize() {
        this._sizeDirty = true;
        this.markDirty();
    }
    /**
     * @ignore
     */
    markDirtyBounds() {
        const display = this._display;
        if (this.get("isMeasured")) {
            this._root._addDirtyBounds(this);
            display.isMeasured = true;
            display.invalidateBounds();
            const parent = this.parent;
            if (parent && this.get("position") != "absolute") {
                if (parent.get("width") == null || parent.get("height") == null || parent.get("layout")) {
                    parent.markDirtyBounds();
                }
            }
            if (this.get("focusable")) {
                this.markDirtyAccessibility();
            }
        }
    }
    /**
     * @ignore
     */
    markDirtyAccessibility() {
        //if (this._root.focused(this)) {
        this._root._invalidateAccessibility(this);
        //}
    }
    /**
     * @ignore
     */
    markDirtyLayer() {
        //this._display.markDirtyLayer(this.isDirty("opacity") || this.isDirty("visible")); https://codepen.io/team/amcharts/pen/gOWZPmP <- problems
        this._display.markDirtyLayer(true);
    }
    /**
     * @ignore
     */
    markDirty() {
        super.markDirty();
        this.markDirtyLayer();
    }
    _updateBounds() {
        const oldBounds = this._adjustedLocalBounds;
        let newBounds;
        // if display.visible == false, it still returns bounds
        if (!this.get("visible") || !this.getPrivate("visible") || this.get("forceHidden")) {
            newBounds = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
            this._localBounds = newBounds;
            this._adjustedLocalBounds = newBounds;
        }
        else {
            this._getBounds();
            this._fixMinBounds(this._localBounds);
            this.updatePivotPoint();
            this._adjustedLocalBounds = this._display.getAdjustedBounds(this._localBounds);
            newBounds = this._adjustedLocalBounds;
        }
        if (!oldBounds || (oldBounds.left !== newBounds.left || oldBounds.top !== newBounds.top || oldBounds.right !== newBounds.right || oldBounds.bottom !== newBounds.bottom)) {
            const eventType = "boundschanged";
            if (this.events.isEnabled(eventType)) {
                this.events.dispatch(eventType, { type: eventType, target: this });
            }
            if (this.parent) {
                this.parent.markDirty();
                this.parent.markDirtyBounds();
            }
            // Update tooltip position together with the Sprite
            if (this.getPrivate("showingTooltip")) {
                this.showTooltip();
            }
        }
    }
    _fixMinBounds(bounds) {
        let minWidth = this.get("minWidth", this.getPrivate("minWidth"));
        let minHeight = this.get("minHeight", this.getPrivate("minHeight"));
        if (isNumber(minWidth)) {
            if (bounds.right - bounds.left < minWidth) {
                bounds.right = bounds.left + minWidth;
            }
        }
        if (isNumber(minHeight)) {
            if (bounds.bottom - bounds.top < minHeight) {
                bounds.bottom = bounds.top + minHeight;
            }
        }
        let privateWidth = this.getPrivate("width");
        let privateHeight = this.getPrivate("height");
        if (isNumber(privateWidth)) {
            if (privateWidth > 0) {
                bounds.right = bounds.left + privateWidth;
            }
            else {
                bounds.left = bounds.right + privateWidth;
            }
        }
        if (isNumber(privateHeight)) {
            if (privateHeight > 0) {
                bounds.bottom = bounds.top + privateHeight;
            }
            else {
                bounds.top = bounds.bottom + privateHeight;
            }
        }
    }
    _removeParent(parent) {
        if (parent) {
            parent.children.removeValue(this);
            removeFirst(parent._percentageSizeChildren, this);
            removeFirst(parent._percentagePositionChildren, this);
        }
    }
    _clearDirty() {
        super._clearDirty();
        this._sizeDirty = false;
        //this._statesHandled = false;
    }
    /**
     * Simulate hover over element.
     */
    hover() {
        if (!this.isDisposed()) {
            this.showTooltip();
            this._handleOver();
        }
    }
    /**
     * Simulate unhover over element.
     */
    unhover() {
        if (!this.isDisposed()) {
            this.hideTooltip();
            this._handleOut();
        }
    }
    /**
     * Shows element's [[Tooltip]].
     */
    showTooltip(point) {
        if (!this.isDisposed()) {
            const tooltip = this.getTooltip();
            const tooltipText = this.get("tooltipText");
            const tooltipHTML = this.get("tooltipHTML");
            if ((tooltipText || tooltipHTML) && tooltip) {
                const tooltipPosition = this.get("tooltipPosition");
                const tooltipTarget = this.getPrivate("tooltipTarget", this);
                if (tooltipPosition == "fixed" || !point) {
                    this._display._setMatrix();
                    point = this.toGlobal(tooltipTarget._getTooltipPoint());
                }
                if (tooltipPosition == "pointer") {
                    const lastTooltipCoords = this.getPrivate("lastTooltipCoords");
                    if (lastTooltipCoords && lastTooltipCoords.x == point.x && lastTooltipCoords.y == point.y) {
                        return;
                    }
                    else {
                        this.setPrivate("lastTooltipCoords", point);
                    }
                }
                tooltip.set("pointTo", point);
                tooltip.set("tooltipTarget", tooltipTarget);
                if (!tooltip.get("x")) {
                    tooltip.set("x", point.x);
                }
                if (!tooltip.get("y")) {
                    tooltip.set("y", point.y);
                }
                if (tooltipText) {
                    tooltip.label.set("text", tooltipText);
                }
                if (tooltipHTML) {
                    tooltip.label.set("html", tooltipHTML);
                }
                const dataItem = this.dataItem;
                if (dataItem) {
                    tooltip.label._setDataItem(dataItem);
                }
                if (this.get("showTooltipOn") == "always" && (point.x < 0 || point.x > this._root.width() || point.y < 0 || point.y > this._root.height())) {
                    this.hideTooltip();
                    return;
                }
                tooltip.label.text.markDirtyText();
                const promise = tooltip.show();
                this.setPrivateRaw("showingTooltip", true);
                return promise;
            }
        }
    }
    /**
     * Hides element's [[Tooltip]].
     */
    hideTooltip() {
        const tooltip = this.getTooltip();
        if (tooltip) {
            this.removePrivate("lastTooltipCoords");
            if (tooltip.get("tooltipTarget") == this.getPrivate("tooltipTarget", this) || this.get("tooltip") == tooltip) {
                let timeout = tooltip.get("keepTargetHover") && tooltip.get("stateAnimationDuration", 0) == 0 ? 400 : undefined;
                const promise = tooltip.hide(timeout);
                this.setPrivateRaw("showingTooltip", false);
                return promise;
            }
        }
    }
    _getTooltipPoint() {
        const bounds = this._localBounds;
        if (bounds) {
            let x = 0;
            let y = 0;
            if (!this.get("isMeasured")) {
                x = relativeToValue(this.get("tooltipX", 0), this.width());
                y = relativeToValue(this.get("tooltipY", 0), this.height());
            }
            else {
                x = bounds.left + relativeToValue(this.get("tooltipX", 0), bounds.right - bounds.left);
                y = bounds.top + relativeToValue(this.get("tooltipY", 0), bounds.bottom - bounds.top);
            }
            return { x, y };
        }
        return { x: 0, y: 0 };
    }
    /**
     * Returns [[Tooltip]] used for this element.
     *
     * @return Tooltip
     */
    getTooltip() {
        let tooltip = this.get("tooltip");
        if (!tooltip) {
            let parent = this.parent;
            if (parent) {
                return parent.getTooltip();
            }
        }
        else {
            return tooltip;
        }
    }
    _updatePosition() {
        const parent = this.parent;
        let dx = this.get("dx", 0);
        let dy = this.get("dy", 0);
        let x = this.get("x");
        let _x = this.getPrivate("x");
        let xx = 0;
        let yy = 0;
        const position = this.get("position");
        if (x instanceof Percent) {
            if (parent) {
                x = parent.innerWidth() * x.value + parent.get("paddingLeft", 0);
            }
            else {
                x = 0;
            }
        }
        if (isNumber(x)) {
            xx = x + dx;
        }
        else {
            if (_x != null) {
                xx = _x;
            }
            else if (parent) {
                if (position == "relative") {
                    xx = parent.get("paddingLeft", 0) + dx;
                }
            }
        }
        let y = this.get("y");
        let _y = this.getPrivate("y");
        if (y instanceof Percent) {
            if (parent) {
                y = parent.innerHeight() * y.value + parent.get("paddingTop", 0);
            }
            else {
                y = 0;
            }
        }
        if (isNumber(y)) {
            yy = y + dy;
        }
        else {
            if (_y != null) {
                yy = _y;
            }
            else if (parent) {
                if (position == "relative") {
                    yy = parent.get("paddingTop", 0) + dy;
                }
            }
        }
        const display = this._display;
        if (display.x != xx || display.y != yy) {
            display.invalidateBounds();
            display.x = xx;
            display.y = yy;
            const eventType = "positionchanged";
            if (this.events.isEnabled(eventType)) {
                this.events.dispatch(eventType, { type: eventType, target: this });
            }
        }
        // Update tooltip position together with the Sprite
        if (this.getPrivate("showingTooltip")) {
            this.showTooltip();
        }
    }
    /**
     * Returns element's actual X position in pixels.
     *
     * @return X (px)
     */
    x() {
        let x = this.get("x");
        let _x = this.getPrivate("x");
        const parent = this.parent;
        if (parent) {
            if (x instanceof Percent) {
                return relativeToValue(x, parent.innerWidth()) + parent.get("paddingLeft", 0);
            }
            else {
                if (!isNumber(x)) {
                    if (_x != null) {
                        return _x;
                    }
                    else {
                        return parent.get("paddingLeft", this._display.x);
                    }
                }
                else {
                    return x;
                }
            }
        }
        return this._display.x;
    }
    /**
     * Returns element's actual Y position in pixels.
     *
     * @return Y (px)
     */
    y() {
        let _y = this.getPrivate("y");
        if (_y != null) {
            return _y;
        }
        let y = this.get("y");
        const parent = this.parent;
        if (parent) {
            if (y instanceof Percent) {
                return relativeToValue(y, parent.innerHeight()) + parent.get("paddingTop", 0);
            }
            else {
                if (!isNumber(y)) {
                    if (_y != null) {
                        return _y;
                    }
                    else {
                        return parent.get("paddingTop", this._display.y);
                    }
                }
                else {
                    return y;
                }
            }
        }
        return this._display.y;
    }
    _dispose() {
        super._dispose();
        this._display.dispose();
        this._removeTemplateField();
        this._removeParent(this.parent);
        this._root._removeFocusElement(this);
        const tooltip = this.get("tooltip");
        if (tooltip) {
            tooltip.dispose();
        }
        this.markDirty();
    }
    /**
     * @ignore
     */
    adjustedLocalBounds() {
        this._fixMinBounds(this._adjustedLocalBounds);
        return this._adjustedLocalBounds;
    }
    /**
     * Returns local coordinates of the element's bounds.
     *
     * @ignore
     * @return Global bounds
     */
    localBounds() {
        return this._localBounds;
    }
    /**
     * Returns adjusted local coordinates of the element's bounds.
     *
     * @ignore
     * @return Global bounds
     */
    bounds() {
        const bounds = this._adjustedLocalBounds;
        const x = this.x();
        const y = this.y();
        return { left: bounds.left + x, right: bounds.right + x, top: bounds.top + y, bottom: bounds.bottom + y };
    }
    /**
     * Returns global coordinates of the element's bounds.
     *
     * @ignore
     * @return Global bounds
     */
    globalBounds() {
        const bounds = this.localBounds();
        const p0 = this.toGlobal({ x: bounds.left, y: bounds.top });
        const p1 = this.toGlobal({ x: bounds.right, y: bounds.top });
        const p2 = this.toGlobal({ x: bounds.right, y: bounds.bottom });
        const p3 = this.toGlobal({ x: bounds.left, y: bounds.bottom });
        return {
            left: Math.min(p0.x, p1.x, p2.x, p3.x),
            top: Math.min(p0.y, p1.y, p2.y, p3.y),
            right: Math.max(p0.x, p1.x, p2.x, p3.x),
            bottom: Math.max(p0.y, p1.y, p2.y, p3.y)
        };
    }
    _onShow(_duration) {
    }
    _onHide(_duration) {
    }
    /**
     * Plays initial reveal animation regardless if element is currently hidden
     * or visible.
     *
     * @param   duration  Duration of the animation in milliseconds
     * @param   delay     Delay showing of the element by X milliseconds
     * @return            Promise
     */
    appear(duration, delay) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hide(0);
            if (delay) {
                return new Promise((success, _error) => {
                    this.setTimeout(() => {
                        success(this.show(duration));
                    }, delay);
                });
            }
            else {
                return this.show(duration);
            }
        });
    }
    /**
     * Shows currently hidden element and returns a `Promise` which completes
     * when all showing animations are finished.
     *
     * ```TypeScript
     * series.show().then(function(ev) {
     *   console.log("Series is now fully visible");
     * })
     * ```
     * ```JavaScript
     * series.show().then(function(ev) {
     *   console.log("Series is now fully visible");
     * })
     * ```
     *
     * @return Promise
     */
    show(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isShowing) {
                this._isHidden = false;
                this._isShowing = true;
                this._isHiding = false;
                if (this.states.lookup("default").get("visible")) {
                    this.set("visible", true);
                }
                this._onShow(duration);
                const animations = this.states.applyAnimate("default", duration);
                yield waitForAnimations(animations);
                this._isShowing = false;
            }
        });
    }
    /**
     * Hides the element and returns a `Promise` which completes when all hiding
     * animations are finished.
     *
     * ```TypeScript
     * series.hide().then(function(ev) {
     *   console.log("Series finished hiding");
     * })
     * ```
     * ```JavaScript
     * series.hide().then(function(ev) {
     *   console.log("Series finished hiding");
     * })
     * ```
     *
     * @return Promise
     */
    hide(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isHiding && !this._isHidden) {
                this._isHiding = true;
                this._isShowing = false;
                let state = this.states.lookup("hidden");
                if (!state) {
                    state = this.states.create("hidden", {
                        "opacity": 0,
                        "visible": false
                    });
                }
                this._isHidden = true;
                this._onHide(duration);
                const animations = this.states.applyAnimate("hidden", duration);
                yield waitForAnimations(animations);
                this._isHiding = false;
            }
        });
    }
    /**
     * Returns `true` if this element is currently hidden.
     *
     * @return Is hidden?
     */
    isHidden() {
        return this._isHidden;
    }
    /**
     * Returns `true` if this element is currently animating to a default state.
     *
     * @return Is showing?
     */
    isShowing() {
        return this._isShowing;
    }
    /**
     * Returns `true` if this element is currently animating to a hidden state.
     *
     * @return Is hiding?
     */
    isHiding() {
        return this._isHiding;
    }
    /**
     * Returns `true` if this element is currently hovered by a pointer.
     *
     * @return Is hovered?
     */
    isHover() {
        return this._display.hovering();
    }
    /**
     * Returns `true` if this element does currently have focus.
     *
     * @return Is focused?
     */
    isFocus() {
        return this._root.focused(this);
    }
    /**
     * Returns `true` if this element is currently being dragged.
     *
     * @return Is dragged?
     */
    isDragging() {
        return this._isDragging;
    }
    /**
     * Returns `false` if if either public or private setting `visible` is set
     * to `false`, or `forceHidden` is set to `true`.
     *
     * @return Visible?
     */
    isVisible() {
        if (this.get("visible") && this.getPrivate("visible") && !this.get("forceHidden")) {
            return true;
        }
        return false;
    }
    /**
     * Same as `isVisible()`, except it checks all ascendants, too.
     *
     * @since 5.2.7
     * @return Visible?
     */
    isVisibleDeep() {
        return this._parent ? (this._parent.isVisibleDeep() && this.isVisible()) : this.isVisible();
    }
    /**
     * Returns an actual opacity of the element, taking into account all parents.
     *
     * @return Opacity
     * @since 5.2.11
     */
    compositeOpacity() {
        const opacity = this.get("opacity", 1);
        return this._parent ? (this._parent.compositeOpacity() * opacity) : opacity;
    }
    /**
     * Returns an actual scale of the element, taking into account all parents.
     *
     * @return Opacity
     * @since 5.9.2
     */
    compositeScale() {
        const scale = this.get("scale", 1);
        return this._parent ? (this._parent.compositeScale() * scale) : scale;
    }
    /**
     * Returns an actual roation of the element, taking into account all parents.
     *
     * @return Opacity
     * @since 5.9.2
     */
    compositeRotation() {
        const rotation = this.get("rotation", 0);
        return this._parent ? (this._parent.compositeRotation() + rotation) : rotation;
    }
    /**
     * Returns width of this element in pixels.
     *
     * @return Width (px)
     */
    width() {
        let width = this.get("width");
        let maxWidth = this.get("maxWidth", this.getPrivate("maxWidth"));
        let minWidth = this.get("minWidth", this.getPrivate("minWidth"));
        let privateWidth = this.getPrivate("width");
        let w = 0;
        if (isNumber(privateWidth)) {
            w = privateWidth;
        }
        else {
            if (width == null) {
                if (this._adjustedLocalBounds) {
                    w = this._adjustedLocalBounds.right - this._adjustedLocalBounds.left;
                }
            }
            else {
                if (width instanceof Percent) {
                    const parent = this.parent;
                    if (parent) {
                        w = parent.innerWidth() * width.value;
                    }
                    else {
                        w = this._root.width() * width.value;
                    }
                }
                else if (isNumber(width)) {
                    w = width;
                }
            }
        }
        if (isNumber(minWidth)) {
            w = Math.max(minWidth, w);
        }
        if (isNumber(maxWidth)) {
            w = Math.min(maxWidth, w);
        }
        return w;
    }
    /**
     * Returns maximum allowed width of this element in pixels.
     *
     * @return Maximum width (px)
     */
    maxWidth() {
        let maxWidth = this.get("maxWidth", this.getPrivate("maxWidth"));
        if (isNumber(maxWidth)) {
            return maxWidth;
        }
        else {
            let width = this.get("width");
            if (isNumber(width)) {
                return width;
            }
        }
        const parent = this.parent;
        if (parent) {
            return parent.innerWidth();
        }
        return this._root.width();
    }
    /**
     * Returns maximum allowed height of this element in pixels.
     *
     * @return Maximum height (px)
     */
    maxHeight() {
        let maxHeight = this.get("maxHeight", this.getPrivate("maxHeight"));
        if (isNumber(maxHeight)) {
            return maxHeight;
        }
        else {
            let height = this.get("height");
            if (isNumber(height)) {
                return height;
            }
        }
        const parent = this.parent;
        if (parent) {
            return parent.innerHeight();
        }
        return this._root.height();
    }
    /**
     * Returns height of this element in pixels.
     *
     * @return Height (px)
     */
    height() {
        let height = this.get("height");
        let maxHeight = this.get("maxHeight", this.getPrivate("maxHeight"));
        let minHeight = this.get("minHeight", this.getPrivate("minHeight"));
        let privateHeight = this.getPrivate("height");
        let h = 0;
        if (isNumber(privateHeight)) {
            h = privateHeight;
        }
        else {
            if (height == null) {
                if (this._adjustedLocalBounds) {
                    h = this._adjustedLocalBounds.bottom - this._adjustedLocalBounds.top;
                }
            }
            else {
                if (height instanceof Percent) {
                    const parent = this.parent;
                    if (parent) {
                        h = parent.innerHeight() * height.value;
                    }
                    else {
                        h = this._root.height() * height.value;
                    }
                }
                else if (isNumber(height)) {
                    h = height;
                }
            }
        }
        if (isNumber(minHeight)) {
            h = Math.max(minHeight, h);
        }
        if (isNumber(maxHeight)) {
            h = Math.min(maxHeight, h);
        }
        return h;
    }
    _findStaticTemplate(f) {
        // templateField overrides template
        if (this._templateField && f(this._templateField)) {
            return this._templateField;
        }
        return super._findStaticTemplate(f);
    }
    _walkParents(f) {
        if (this._parent || this._virtualParent) {
            this._walkParent(f);
        }
    }
    _walkParent(f) {
        if (this._parent) {
            this._parent._walkParent(f);
        }
        else {
            if (this._virtualParent) {
                this._virtualParent._walkParent(f);
            }
        }
        f(this);
    }
    set virtualParent(parent) {
        this._virtualParent = parent;
        this._applyThemes();
    }
    /**
     * Parent [[Container]] of this element.
     *
     * @return Parent container
     */
    get parent() {
        return this._parent;
    }
    _setParent(parent, updateChildren = false) {
        const prevParent = this._parent;
        if (parent !== prevParent) {
            this.markDirtyBounds();
            parent.markDirty();
            this._parent = parent;
            if (updateChildren) {
                this._removeParent(prevParent);
                if (parent) {
                    this._addPercentageSizeChildren();
                    this._addPercentagePositionChildren();
                }
            }
            this.markDirtyPosition();
            this._applyThemes();
        }
    }
    /**
     * Returns an instance of [[NumberFormatter]] used in this element.
     *
     * If this element does not have it set, global one form [[Root]] is used.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/using-formatters/} for more info
     * @return NumberFormatter instace
     */
    getNumberFormatter() {
        return this.get("numberFormatter", this._root.numberFormatter);
    }
    /**
     * Returns an instance of [[DateFormatter]] used in this element.
     *
     * If this element does not have it set, global one form [[Root]] is used.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/using-formatters/} for more info
     * @return DateFormatter instace
     */
    getDateFormatter() {
        return this.get("dateFormatter", this._root.dateFormatter);
    }
    /**
     * Returns an instance of [[DurationFormatter]] used in this element.
     *
     * If this element does not have it set, global one form [[Root]] is used.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/using-formatters/} for more info
     * @return DurationFormatter instace
     */
    getDurationFormatter() {
        return this.get("durationFormatter", this._root.durationFormatter);
    }
    /**
     * Converts X/Y coordinate within this element to a global coordinate.
     *
     * @param  point  Local coordinate
     * @return        Global coordinate
     */
    toGlobal(point) {
        return this._display.toGlobal(point);
    }
    /**
     * Converts global X/Y coordinate to a coordinate within this element.
     *
     * @param  point  Global coordinate
     * @return        Local coordinate
     */
    toLocal(point) {
        return this._display.toLocal(point);
    }
    _getDownPoint() {
        const id = this._getDownPointId();
        if (id) {
            return this._downPoints[id];
        }
    }
    _getDownPointId() {
        if (this._downPoints) {
            return keysOrdered(this._downPoints, (a, b) => {
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }
                return 0;
            })[0];
        }
    }
    /**
     * Moves sprite to the end of the parent's children array.
     *
     * Depending on `layout` setting of the parten container, it may effect the
     * positioning or overlapping order of the elements.
     */
    toFront() {
        const parent = this.parent;
        if (parent) {
            parent.children.moveValue(this, parent.children.length - 1);
        }
    }
    /**
     * Moves sprite to the beginning of the parent's children array.
     *
     * Depending on `layout` setting of the parten container, it may effect the
     * positioning or overlapping order of the elements.
     */
    toBack() {
        const parent = this.parent;
        if (parent) {
            parent.children.moveValue(this, 0);
        }
    }
}
Object.defineProperty(Sprite, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Sprite"
});
Object.defineProperty(Sprite, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([Sprite.className])
});

/**
 * Base class for patterns.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/patterns/} for more info
 */
class Pattern extends Entity {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_display", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeGraphics()
        });
        Object.defineProperty(this, "_backgroundDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeGraphics()
        });
        Object.defineProperty(this, "_clear", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_pattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    _afterNew() {
        // Applying themes because pattern will not have parent
        super._afterNewApplyThemes();
    }
    get pattern() {
        return this._pattern;
    }
    _draw() { }
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("repetition") || this.isDirty("width") || this.isDirty("height") || this.isDirty("rotation") || this.isDirty("strokeWidth") || this.isDirty("strokeDasharray") || this.isDirty("strokeDashoffset") || this.isDirty("colorOpacity") || this.isDirty("fillOpacity")) {
            this._clear = true;
        }
        this._checkDirtyFill();
    }
    _checkDirtyFill() {
        if (this.isDirty("color") || this.isDirty("fill")) {
            this._clear = true;
        }
    }
    _changed() {
        super._changed();
        if (this._clear) {
            const repetition = this.get("repetition", "");
            const width = this.get("width", 100);
            const height = this.get("height", 100);
            const fill = this.get("fill");
            const fillOpacity = this.get("fillOpacity", 1);
            const backgroundDisplay = this._backgroundDisplay;
            const display = this._display;
            display.clear();
            backgroundDisplay.clear();
            if (fill && (fillOpacity > 0)) {
                backgroundDisplay.beginFill(fill, fillOpacity);
                backgroundDisplay.drawRect(0, 0, width, height);
                backgroundDisplay.endFill();
            }
            display.angle = this.get("rotation", 0);
            //display.pivot = { x: width / 2, y: height / 2 };
            this._draw();
            this._pattern = this._root._renderer.createPattern(display, backgroundDisplay, repetition, width, height);
        }
        this._clear = false;
    }
}
Object.defineProperty(Pattern, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Pattern"
});
Object.defineProperty(Pattern, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([Pattern.className])
});

/**
 * Picture pattern.
 *
 * @since 5.2.15
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/patterns/} for more info
 */
class PicturePattern extends Pattern {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    _beforeChanged() {
        super._beforeChanged();
        this._clear = true;
        if (this.isDirty("src")) {
            this._load();
        }
        const canvas = this.get("canvas");
        if (canvas) {
            this.set("width", canvas.width);
            this.set("height", canvas.height);
        }
    }
    _draw() {
        super._draw();
        const colorOpacity = this.get("colorOpacity");
        if (colorOpacity !== undefined) {
            this._display.alpha = Math.max(0, colorOpacity);
        }
        const image = this._image;
        if (image) {
            const patternWidth = this.get("width", 100);
            const patternHeight = this.get("height", 100);
            // Fit
            const fit = this.get("fit", "image");
            let width = 0;
            let height = 0;
            if (fit == "pattern") {
                width = patternWidth;
                height = patternHeight;
                this.markDirty();
            }
            else {
                width = image.width;
                height = image.height;
                if (fit == "image") {
                    this.set("width", width);
                    this.set("height", height);
                }
            }
            // Position
            const centered = this.get("centered", true);
            let x = 0;
            let y = 0;
            if (centered) {
                x = patternWidth / 2 - width / 2;
                y = patternHeight / 2 - height / 2;
            }
            this._display.image(image, width, height, x, y);
        }
        const canvas = this.get("canvas");
        if (canvas) {
            this._display.image(canvas, canvas.width, canvas.height, 0, 0);
        }
    }
    _load() {
        const src = this.get("src");
        if (src) {
            const image = new Image();
            //image.crossOrigin = "Anonymous";
            image.src = src;
            image.decode().then(() => {
                this._image = image;
                this._draw();
                if (this.events.isEnabled("loaded")) {
                    this.events.dispatch("loaded", { type: "loaded", target: this });
                }
            }).catch((_error) => {
                // TODO: maybe raise error?
            });
        }
    }
}
Object.defineProperty(PicturePattern, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "PicturePattern"
});
Object.defineProperty(PicturePattern, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Pattern.classNames.concat([PicturePattern.className])
});

/**
 * From https://github.com/pixijs/pixi.js/blob/3dd0ff9a935f0bc13a09aefff9eb2872f02c51b9/packages/canvas/canvas-renderer/src/utils/mapCanvasBlendModesToPixi.ts#L13
 */
var BlendMode;
(function (BlendMode) {
    BlendMode["ADD"] = "lighter";
    BlendMode["COLOR"] = "color";
    BlendMode["COLOR_BURN"] = "color-burn";
    BlendMode["COLOR_DODGE"] = "color-dodge";
    BlendMode["DARKEN"] = "darken";
    BlendMode["DIFFERENCE"] = "difference";
    BlendMode["DST_OVER"] = "destination-over";
    BlendMode["EXCLUSION"] = "exclusion";
    BlendMode["HARD_LIGHT"] = "hard-light";
    BlendMode["HUE"] = "hue";
    BlendMode["LIGHTEN"] = "lighten";
    BlendMode["LUMINOSITY"] = "luminosity";
    BlendMode["MULTIPLY"] = "multiply";
    BlendMode["NORMAL"] = "source-over";
    BlendMode["OVERLAY"] = "overlay";
    BlendMode["SATURATION"] = "saturation";
    BlendMode["SCREEN"] = "screen";
    BlendMode["SOFT_LIGHT"] = "soft-light";
    BlendMode["SRC_ATOP"] = "source-atop";
    BlendMode["XOR"] = "xor";
})(BlendMode || (BlendMode = {}));

const visualSettings = ["fill", "fillOpacity", "stroke", "strokeWidth", "strokeOpacity", "fillPattern", "strokePattern", "fillGradient", "strokeGradient", "strokeDasharray", "strokeDashoffset", "shadowBlur", "shadowColor", "shadowOpacity", "shadowOffsetX", "shadowOffsetY", "blur", "sepia", "invert", "brightness", "hue", "contrast", "saturate"];
/**
 * Base class used for drawing shapes.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 * @important
 */
class Graphics extends Sprite {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_display", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeGraphics()
        });
        Object.defineProperty(this, "_clear", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("draw") || this.isDirty("svgPath")) {
            this.markDirtyBounds();
        }
        if (this.isDirty("fill") || this.isDirty("stroke") || this.isDirty("visible") || this.isDirty("forceHidden") || this.isDirty("scale") || this.isDirty("fillGradient") || this.isDirty("strokeGradient") || this.isDirty("fillPattern") || this.isDirty("strokePattern") || this.isDirty("fillOpacity") || this.isDirty("strokeOpacity") || this.isDirty("strokeWidth") || this.isDirty("draw") || this.isDirty("blendMode") || this.isDirty("strokeDasharray") || this.isDirty("strokeDashoffset") || this.isDirty("svgPath") || this.isDirty("lineJoin") || this.isDirty("lineCap") || this.isDirty("shadowColor") || this.isDirty("shadowBlur") || this.isDirty("shadowOffsetX") || this.isDirty("shadowOffsetY")) {
            this._clear = true;
        }
        this._display.crisp = this.get("crisp", false);
        if (this.isDirty("fillGradient")) {
            const gradient = this.get("fillGradient");
            if (gradient) {
                this._display.isMeasured = true;
                const gradientTarget = gradient.get("target");
                if (gradientTarget) {
                    this._disposers.push(gradientTarget.events.on("boundschanged", () => {
                        this._markDirtyKey("fill");
                    }));
                    this._disposers.push(gradientTarget.events.on("positionchanged", () => {
                        this._markDirtyKey("fill");
                    }));
                }
            }
        }
        if (this.isDirty("strokeGradient")) {
            const gradient = this.get("strokeGradient");
            if (gradient) {
                this._display.isMeasured = true;
                const gradientTarget = gradient.get("target");
                if (gradientTarget) {
                    this._disposers.push(gradientTarget.events.on("boundschanged", () => {
                        this._markDirtyKey("stroke");
                    }));
                    this._disposers.push(gradientTarget.events.on("positionchanged", () => {
                        this._markDirtyKey("stroke");
                    }));
                }
            }
        }
    }
    _changed() {
        super._changed();
        if (this._clear) {
            this.markDirtyBounds();
            this.markDirtyLayer();
            this._display.clear();
            let strokeDasharray = this.get("strokeDasharray");
            if (isNumber(strokeDasharray)) {
                if (strokeDasharray < 0.5) {
                    strokeDasharray = [0];
                }
                else {
                    strokeDasharray = [strokeDasharray];
                }
            }
            this._display.setLineDash(strokeDasharray);
            const strokeDashoffset = this.get("strokeDashoffset");
            if (strokeDashoffset) {
                this._display.setLineDashOffset(strokeDashoffset);
            }
            const blendMode = this.get("blendMode", BlendMode.NORMAL);
            this._display.blendMode = blendMode;
            const draw = this.get("draw");
            if (draw && typeof draw === "function") {
                draw(this._display, this);
            }
            const svgPath = this.get("svgPath");
            if (svgPath != null) {
                this._display.svgPath(svgPath);
            }
        }
    }
    _afterChanged() {
        super._afterChanged();
        if (this._clear) {
            const fill = this.get("fill");
            const fillGradient = this.get("fillGradient");
            const fillPattern = this.get("fillPattern");
            const fillOpacity = this.get("fillOpacity");
            const stroke = this.get("stroke");
            const strokeGradient = this.get("strokeGradient");
            const strokePattern = this.get("strokePattern");
            const shadowColor = this.get("shadowColor");
            const shadowBlur = this.get("shadowBlur");
            const shadowOffsetX = this.get("shadowOffsetX");
            const shadowOffsetY = this.get("shadowOffsetY");
            const shadowOpacity = this.get("shadowOpacity");
            if (shadowColor && (shadowBlur || shadowOffsetX || shadowOffsetY)) {
                this._display.shadow(shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity);
            }
            if (fill && !fillGradient) {
                this._display.beginFill(fill, fillOpacity);
                this._display.endFill();
            }
            if (fillGradient) {
                if (fill) {
                    const stops = fillGradient.get("stops", []);
                    if (stops.length) {
                        each$1(stops, (stop) => {
                            if ((!stop.color || stop.colorInherited) && fill) {
                                stop.color = fill;
                                stop.colorInherited = true;
                            }
                            if (stop.opacity == null || stop.opacityInherited) {
                                stop.opacity = fillOpacity;
                                stop.opacityInherited = true;
                            }
                        });
                    }
                }
                const gradient = fillGradient.getFill(this);
                if (gradient) {
                    this._display.beginFill(gradient, fillOpacity);
                    this._display.endFill();
                }
            }
            if (fillPattern) {
                const pattern = fillPattern.pattern;
                if (pattern) {
                    this._display.beginFill(pattern, fillOpacity);
                    this._display.endFill();
                    if (fillPattern instanceof PicturePattern) {
                        fillPattern.events.once("loaded", () => {
                            this._clear = true;
                            this.markDirty();
                        });
                    }
                }
            }
            if (stroke || strokeGradient || strokePattern) {
                const strokeOpacity = this.get("strokeOpacity");
                let strokeWidth = this.get("strokeWidth", 1);
                if (this.get("nonScalingStroke")) {
                    strokeWidth = strokeWidth / this.get("scale", 1);
                }
                if (this.get("crisp")) {
                    strokeWidth /= this._root._renderer.resolution;
                }
                const lineJoin = this.get("lineJoin");
                const lineCap = this.get("lineCap");
                if (stroke && !strokeGradient) {
                    this._display.lineStyle(strokeWidth, stroke, strokeOpacity, lineJoin, lineCap);
                    this._display.endStroke();
                }
                if (strokeGradient) {
                    const stops = strokeGradient.get("stops", []);
                    if (stops.length) {
                        each$1(stops, (stop) => {
                            if ((!stop.color || stop.colorInherited) && stroke) {
                                stop.color = stroke;
                                stop.colorInherited = true;
                            }
                            if (stop.opacity == null || stop.opacityInherited) {
                                stop.opacity = strokeOpacity;
                                stop.opacityInherited = true;
                            }
                        });
                    }
                    const gradient = strokeGradient.getFill(this);
                    if (gradient) {
                        this._display.lineStyle(strokeWidth, gradient, strokeOpacity, lineJoin, lineCap);
                        this._display.endStroke();
                    }
                }
                if (strokePattern) {
                    /*
                    let changed = false;
                    
                    if (stroke && (!strokePattern.get("color") || strokePattern.get("colorInherited"))) {
                        strokePattern.set("color", stroke);
                        strokePattern.set("colorInherited", true);
                        changed = true;
                    }
                    if (changed) {
                        // @todo: is this OK?
                        strokePattern._changed();
                    }
                    */
                    let pattern = strokePattern.pattern;
                    if (pattern) {
                        this._display.lineStyle(strokeWidth, pattern, strokeOpacity, lineJoin, lineCap);
                        this._display.endStroke();
                        if (strokePattern instanceof PicturePattern) {
                            strokePattern.events.once("loaded", () => {
                                this._clear = true;
                                this.markDirty();
                            });
                        }
                    }
                }
            }
            if (this.getPrivate("showingTooltip")) {
                this.showTooltip();
            }
        }
        this._clear = false;
    }
}
Object.defineProperty(Graphics, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Graphics"
});
Object.defineProperty(Graphics, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Sprite.classNames.concat([Graphics.className])
});

/**
 * Draws a rectangle.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 * @important
 */
class Rectangle extends Graphics {
    _afterNew() {
        super._afterNew();
        this._display.isMeasured = true;
        this.setPrivateRaw("trustBounds", true);
    }
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("width") || this.isDirty("height") || this.isPrivateDirty("width") || this.isPrivateDirty("height")) {
            this._clear = true;
        }
    }
    _changed() {
        super._changed();
        if (this._clear && !this.get("draw")) {
            this._draw();
        }
    }
    _draw() {
        let w = this.width();
        let h = this.height();
        let x = 0;
        let y = 0;
        let wSign = w / Math.abs(w);
        let hSign = h / Math.abs(h);
        if (this.get("containStroke", false)) {
            const strokeWidth = this.get("strokeWidth", 0);
            w -= strokeWidth * wSign;
            h -= strokeWidth * hSign;
            x += strokeWidth / 2 * wSign;
            y += strokeWidth / 2 * hSign;
        }
        this._display.drawRect(x, y, w, h);
    }
    _updateSize() {
        this.markDirty();
        this._clear = true;
    }
}
Object.defineProperty(Rectangle, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Rectangle"
});
Object.defineProperty(Rectangle, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Graphics.classNames.concat([Rectangle.className])
});

function eachChildren(container, f) {
    if (container.get("reverseChildren", false)) {
        container.children.eachReverse(f);
    }
    else {
        container.children.each(f);
    }
}
/**
 * Base class for [[Container]] layouts.
 */
class Layout extends Entity {
}
Object.defineProperty(Layout, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Layout"
});
Object.defineProperty(Layout, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([Layout.className])
});

/**
 * A horizontal children layout for [[Container]].
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/containers/#Layout} for more info
 */
class HorizontalLayout extends Layout {
    /**
     * @ignore
     */
    updateContainer(container) {
        let paddingLeft = container.get("paddingLeft", 0);
        let availableWidth = container.innerWidth();
        let totalPercent = 0;
        eachChildren(container, (child) => {
            if (child.isVisible()) {
                if (child.get("position") == "relative") {
                    let childWidth = child.get("width");
                    if (childWidth instanceof Percent) {
                        totalPercent += childWidth.value;
                        let w = availableWidth * childWidth.value;
                        let minWidth = child.get("minWidth", child.getPrivate("minWidth", -Infinity));
                        if (minWidth > w) {
                            availableWidth -= minWidth;
                            totalPercent -= childWidth.value;
                        }
                        let maxWidth = child.get("maxWidth", child.getPrivate("maxWidth", Infinity));
                        if (w > maxWidth) {
                            availableWidth -= maxWidth;
                            totalPercent -= childWidth.value;
                        }
                    }
                    else {
                        if (!isNumber(childWidth)) {
                            childWidth = child.width();
                        }
                        availableWidth -= childWidth + child.get("marginLeft", 0) + child.get("marginRight", 0);
                    }
                }
            }
        });
        if (availableWidth <= 0 || availableWidth == Infinity) {
            availableWidth = .1;
        }
        //if (availableWidth > 0) {
        eachChildren(container, (child) => {
            if (child.isVisible()) {
                if (child.get("position") == "relative") {
                    let childWidth = child.get("width");
                    if (childWidth instanceof Percent) {
                        let privateWidth = availableWidth * childWidth.value / totalPercent - child.get("marginLeft", 0) - child.get("marginRight", 0);
                        let minWidth = child.get("minWidth", child.getPrivate("minWidth", -Infinity));
                        let maxWidth = child.get("maxWidth", child.getPrivate("maxWidth", Infinity));
                        privateWidth = Math.min(Math.max(minWidth, privateWidth), maxWidth);
                        child.setPrivate("width", privateWidth);
                    }
                    else {
                        if (child._prevSettings.width instanceof Percent) {
                            child.setPrivate("width", undefined);
                        }
                    }
                }
            }
        });
        //}
        let prevX = paddingLeft;
        eachChildren(container, (child) => {
            if (child.get("position") == "relative") {
                if (child.isVisible()) {
                    let bounds = child.adjustedLocalBounds();
                    let marginLeft = child.get("marginLeft", 0);
                    let marginRight = child.get("marginRight", 0);
                    let maxWidth = child.get("maxWidth");
                    let left = bounds.left;
                    let right = bounds.right;
                    if (maxWidth) {
                        if (right - left > maxWidth) {
                            right = left + maxWidth;
                        }
                    }
                    let x = prevX + marginLeft - left;
                    child.setPrivate("x", x);
                    prevX = x + right + marginRight;
                }
                else {
                    child.setPrivate("x", undefined);
                }
            }
        });
    }
}
Object.defineProperty(HorizontalLayout, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "HorizontalLayout"
});
Object.defineProperty(HorizontalLayout, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Layout.classNames.concat([HorizontalLayout.className])
});

/**
 * A vertical children layout for [[Container]].
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/containers/#Layout} for more info
 */
class VerticalLayout extends Layout {
    /**
     * @ignore
     */
    updateContainer(container) {
        let paddingTop = container.get("paddingTop", 0);
        let availableHeight = container.innerHeight();
        let totalPercent = 0;
        eachChildren(container, (child) => {
            if (child.isVisible()) {
                if (child.get("position") == "relative") {
                    let childHeight = child.get("height");
                    if (childHeight instanceof Percent) {
                        totalPercent += childHeight.value;
                        let h = availableHeight * childHeight.value;
                        let minHeight = child.get("minHeight", child.getPrivate("minHeight", -Infinity));
                        if (minHeight > h) {
                            availableHeight -= minHeight;
                            totalPercent -= childHeight.value;
                        }
                        let maxHeight = child.get("maxHeight", child.getPrivate("maxHeight", Infinity));
                        if (h > maxHeight) {
                            availableHeight -= maxHeight;
                            totalPercent -= childHeight.value;
                        }
                    }
                    else {
                        if (!isNumber(childHeight)) {
                            childHeight = child.height();
                        }
                        availableHeight -= childHeight + child.get("marginTop", 0) + child.get("marginBottom", 0);
                    }
                }
            }
        });
        if (availableHeight <= 0 || availableHeight == Infinity) {
            availableHeight = .1;
        }
        //if (availableHeight > 0) {
        eachChildren(container, (child) => {
            if (child.isVisible()) {
                if (child.get("position") == "relative") {
                    let childHeight = child.get("height");
                    if (childHeight instanceof Percent) {
                        let privateHeight = availableHeight * childHeight.value / totalPercent - child.get("marginTop", 0) - child.get("marginBottom", 0);
                        let minHeight = child.get("minHeight", child.getPrivate("minHeight", -Infinity));
                        let maxHeight = child.get("maxHeight", child.getPrivate("maxHeight", Infinity));
                        privateHeight = Math.min(Math.max(minHeight, privateHeight), maxHeight);
                        child.setPrivate("height", privateHeight);
                    }
                    else {
                        if (child._prevSettings.height instanceof Percent) {
                            child.setPrivate("height", undefined);
                        }
                    }
                }
            }
        });
        //}
        let prevY = paddingTop;
        eachChildren(container, (child) => {
            if (child.get("position") == "relative") {
                if (child.isVisible()) {
                    let bounds = child.adjustedLocalBounds();
                    let marginTop = child.get("marginTop", 0);
                    let top = bounds.top;
                    let bottom = bounds.bottom;
                    let maxHeight = child.get("maxHeight");
                    if (maxHeight) {
                        if (bottom - top > maxHeight) {
                            bottom = top + maxHeight;
                        }
                    }
                    let marginBottom = child.get("marginBottom", 0);
                    let y = prevY + marginTop - top;
                    child.setPrivate("y", y);
                    prevY = y + bottom + marginBottom;
                }
                else {
                    child.setPrivate("y", undefined);
                }
            }
        });
    }
}
Object.defineProperty(VerticalLayout, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "VerticalLayout"
});
Object.defineProperty(VerticalLayout, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Layout.classNames.concat([VerticalLayout.className])
});

/**
 * A grid children layout for [[Container]].
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/containers/#Layout} for more info
 */
class GridLayout extends Layout {
    _afterNew() {
        this._setRawDefault("maxColumns", Number.MAX_VALUE);
        super._afterNew();
    }
    /**
     * @ignore
     */
    updateContainer(container) {
        let paddingLeft = container.get("paddingLeft", 0);
        let paddingRight = container.get("paddingRight", 0);
        let paddingTop = container.get("paddingTop", 0);
        let availableWidth = container.maxWidth() - paddingLeft - paddingRight;
        let minCellWidth = availableWidth;
        let maxCellWidth = 1;
        eachChildren(container, (child) => {
            if (child.get("visible") && child.getPrivate("visible") && !child.get("forceHidden")) {
                if (child.get("position") != "absolute") {
                    let childWidth = child.width();
                    if (childWidth < minCellWidth) {
                        minCellWidth = childWidth;
                    }
                    if (childWidth > maxCellWidth) {
                        maxCellWidth = childWidth;
                    }
                }
            }
        });
        minCellWidth = fitToRange(minCellWidth, 1, availableWidth);
        maxCellWidth = fitToRange(maxCellWidth, 1, availableWidth);
        let columnCount = 1;
        if (this.get("fixedWidthGrid")) {
            columnCount = availableWidth / maxCellWidth;
        }
        else {
            columnCount = availableWidth / minCellWidth;
        }
        columnCount = Math.max(1, Math.floor(columnCount));
        columnCount = Math.min(this.get("maxColumns", Number.MAX_VALUE), columnCount);
        let columnWidths = this.getColumnWidths(container, columnCount, maxCellWidth, availableWidth);
        let prevY = paddingTop;
        let column = 0;
        let maxRowHeight = 0;
        columnCount = columnWidths.length;
        let prevX = paddingLeft;
        eachChildren(container, (child) => {
            if (child.get("position") == "relative" && child.isVisible()) {
                const marginTop = child.get("marginTop", 0);
                const marginBottom = child.get("marginBottom", 0);
                let bounds = child.adjustedLocalBounds();
                let marginLeft = child.get("marginLeft", 0);
                let marginRight = child.get("marginRight", 0);
                let x = prevX + marginLeft - bounds.left;
                let y = prevY + marginTop - bounds.top;
                child.setPrivate("x", x);
                child.setPrivate("y", y);
                prevX += columnWidths[column] + marginRight;
                maxRowHeight = Math.max(maxRowHeight, child.height() + marginTop + marginBottom);
                column++;
                if (column >= columnCount) {
                    column = 0;
                    prevX = paddingLeft;
                    prevY += maxRowHeight;
                    maxRowHeight = 0;
                }
            }
        });
    }
    /**
     * @ignore
     */
    getColumnWidths(container, columnCount, maxCellWidth, availableWidth) {
        let totalWidth = 0;
        let columnWidths = [];
        let column = 0;
        eachChildren(container, (child) => {
            let bounds = child.adjustedLocalBounds();
            if (child.get("position") != "absolute" && child.isVisible()) {
                if (this.get("fixedWidthGrid")) {
                    columnWidths[column] = maxCellWidth;
                }
                else {
                    columnWidths[column] = Math.max(columnWidths[column] | 0, bounds.right - bounds.left + child.get("marginLeft", 0) + child.get("marginRight", 0));
                }
                if (column < container.children.length - 1) {
                    column++;
                    if (column == columnCount) {
                        column = 0;
                    }
                }
            }
        });
        each$1(columnWidths, (w) => {
            totalWidth += w;
        });
        if (totalWidth > availableWidth) {
            if (columnCount > 2) {
                columnCount -= 1;
                return this.getColumnWidths(container, columnCount, maxCellWidth, availableWidth);
            }
            else {
                return [availableWidth];
            }
        }
        return columnWidths;
    }
}
Object.defineProperty(GridLayout, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "GridLayout"
});
Object.defineProperty(GridLayout, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Layout.classNames.concat([GridLayout.className])
});

class TextFormatter {
    /**
     * Replaces brackets with temporary placeholders.
     *
     * @ignore Exclude from docs
     * @param text  Input text
     * @return Escaped text
     */
    static escape(text) {
        return text.
            replace(/\[\[/g, this.prefix + "1").
            replace(/([^\/\]]{1})\]\]/g, "$1" + this.prefix + "2").
            replace(/\]\]/g, this.prefix + "2").
            replace(/\{\{/g, this.prefix + "3").
            replace(/\}\}/g, this.prefix + "4").
            replace(/\'\'/g, this.prefix + "5");
    }
    /**
     * Replaces placeholders back to brackets.
     *
     * @ignore Exclude from docs
     * @param text  Escaped text
     * @return Unescaped text
     */
    static unescape(text) {
        return text.
            replace(new RegExp(this.prefix + "1", "g"), "[[").
            replace(new RegExp(this.prefix + "2", "g"), "]]").
            replace(new RegExp(this.prefix + "3", "g"), "{{").
            replace(new RegExp(this.prefix + "4", "g"), "}}").
            replace(new RegExp(this.prefix + "5", "g"), "''");
    }
    /**
     * Cleans up the text text for leftover double square brackets.
     *
     * @ignore Exclude from docs
     * @param text  Input text
     * @return Cleaned up text
     */
    static cleanUp(text) {
        return text.
            replace(/\[\[/g, "[").
            replace(/\]\]/g, "]").
            replace(/\{\{/g, "{").
            replace(/\}\}/g, "}").
            replace(/\'\'/g, "'");
    }
    /**
     * Splits string into chunks. (style blocks, quoted blocks, regular blocks)
     *
     * If the second parameter `quotedBlocks` is set to `true` this method will
     * also single out text blocks enclosed within single quotes that no
     * formatting should be applied to, and they should be displayed as is.
     *
     * Default for the above is `false`, so that you can use single quote in text
     * without escaping it.
     *
     * If enabled, single quotes can be escaped by doubling it - adding two
     * single quotes, which will be replaced by a one single quote in the final
     * output.
     *
     * @ignore Exclude from docs
     * @param text          Text to chunk
     * @param quotedBlocks  Use quoted blocks
     * @param noFormatting  Formatting blocks will be treated as regular text
     * @return Array of string chunks
     */
    static chunk(text, quotedBlocks = false, noFormatting = false) {
        // Init result
        let res = [];
        // Replace double (escaped) square spaces and quotes with temporary codes
        text = this.escape(text);
        // Deal with style blocks
        let chunks = quotedBlocks ? text.split("'") : [text];
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i];
            // Empty?
            if (chunk === "") {
                continue;
            }
            if ((i % 2) === 0) {
                // Text outside quotes
                // Parse for style blocks which are "text" chunks, the rest chunks are
                // "value"
                chunk = chunk.replace(/\]\[/g, "]" + PLACEHOLDER + "[");
                chunk = chunk.replace(/\[\]/g, "[ ]");
                let chunks2 = chunk.split(/[\[\]]+/);
                for (let i2 = 0; i2 < chunks2.length; i2++) {
                    let chunk2 = this.cleanUp(this.unescape(chunks2[i2]));
                    // Placeholder?
                    if (chunk2 === PLACEHOLDER) {
                        continue;
                    }
                    // Empty?
                    if (chunk2 === "") {
                        continue;
                    }
                    // Block or value
                    if ((i2 % 2) === 0) {
                        res.push({
                            "type": "value",
                            "text": chunk2
                        });
                    }
                    else {
                        res.push({
                            "type": noFormatting ? "value" : "format",
                            "text": "[" + chunk2 + "]"
                        });
                    }
                }
            }
            else {
                // A text within doublequotes
                // All chunks are "text"
                let chunks2 = chunk.split(/[\[\]]+/);
                for (let i2 = 0; i2 < chunks2.length; i2++) {
                    let chunk2 = this.cleanUp(this.unescape(chunks2[i2]));
                    // Empty?
                    if (chunk2 === "") {
                        continue;
                    }
                    // Block or text
                    if ((i2 % 2) === 0) {
                        res.push({
                            "type": "text",
                            "text": chunk2
                        });
                    }
                    else if (this.isImage(chunk2)) {
                        res.push({
                            "type": "image",
                            "text": "[" + chunk2 + "]"
                        });
                    }
                    else {
                        res.push({
                            "type": "format",
                            "text": "[" + chunk2 + "]"
                        });
                    }
                }
            }
        }
        return res;
    }
    /**
     * Checks if supplied format contains image information and should be
     * formatted as such.
     * I.e.: `[img: myImage.png]`
     *
     * @ignore
     * @param  text  Format
     * @return true if it is an image
     */
    static isImage(text) {
        return text.match(/img[ ]?:/) ? true : false;
    }
    static getTextStyle(style) {
        // let textStyle: string[] = [];
        // let textFill: string | undefined;
        let format = {};
        if (style == "" || style == "[ ]") {
            return {};
        }
        // Pre-process quoted text
        const q = style.match(/('[^']*')|("[^"]*")/gi);
        if (q) {
            for (let i = 0; i < q.length; i++) {
                style = style.replace(q[i], q[i].replace(/['"]*/g, "").replace(/[ ]+/g, "+"));
            }
        }
        // Get style parts
        let b = style.match(/([\w\-]*:[\s]?[^;\s\]]*)|(\#[\w]{1,6})|([\w\-]+)|(\/)/gi);
        // Empty?
        if (!b) {
            return {};
        }
        // Check each part
        for (let i = 0; i < b.length; i++) {
            if (b[i].match(/^(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)$/i)) {
                format.fontWeight = b[i];
            }
            else if (b[i].match(/^(underline|line-through)$/i)) {
                format.textDecoration = b[i];
            }
            else if (b[i] == "/") ;
            else if (!b[i].match(/:/)) {
                // Color
                format.fill = Color.fromString(b[i]);
            }
            else {
                const p = b[i].replace("+", " ").split(/:[ ]*/);
                format[p[0]] = p[1];
                //textStyle.push(b[i].replace(/^[a-zA-Z]:[ ]*/, ""));
                //b[i] = b[i].replace(/\+/g, " ");
            }
        }
        return format;
    }
}
Object.defineProperty(TextFormatter, "prefix", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "__amcharts__"
});

/** @ignore */ /** */
/**
 * @ignore
 */
function populateString(target, string) {
    if (string != null) {
        string = "" + string;
        string = TextFormatter.escape(string);
        let tags = string.match(/\{([^}]+)\}/g);
        let i;
        if (tags) {
            for (i = 0; i < tags.length; i++) {
                let tag = tags[i].replace(/\{([^}]+)\}/, "$1");
                let value = getTagValue(target, tag);
                if (value == null) {
                    value = "";
                }
                string = string.split(tags[i]).join(value);
            }
        }
        string = TextFormatter.unescape(string);
    }
    else {
        string = "";
    }
    // TODO: apply adapter?
    return string;
}
/**
 * @ignore
 */
function getTagValue(target, tagName, format) {
    let value;
    const dataItem = target.dataItem;
    // Parse parts
    let parts = [];
    let reg = /(format[a-zA-Z]*)\((.*)\)|([^.]+)/g;
    let matches;
    while (true) {
        matches = reg.exec(tagName);
        if (matches === null) {
            break;
        }
        if (matches[3]) {
            // Simple property
            parts.push({
                prop: matches[3]
            });
            // Check if maybe we should force a formatter on this value
            const dateFields = target.getDateFormatter().get("dateFields", []);
            const numericFields = target.getNumberFormatter().get("numericFields", []);
            const durationFields = target.getDurationFormatter().get("durationFields", []);
            if (dateFields.indexOf(matches[3]) !== -1) {
                parts.push({
                    method: "formatDate",
                    params: []
                });
            }
            else if (numericFields.indexOf(matches[3]) !== -1) {
                parts.push({
                    method: "formatNumber",
                    params: []
                });
            }
            else if (durationFields.indexOf(matches[3]) !== -1) {
                parts.push({
                    method: "formatDuration",
                    params: []
                });
            }
        }
        else {
            // Method
            // Parse parameters
            let params = [];
            if (trim(matches[2]) != "") {
                let reg2 = /'([^']*)'|"([^"]*)"|([0-9\-]+)/g;
                let matches2;
                while (true) {
                    matches2 = reg2.exec(matches[2]);
                    if (matches2 === null) {
                        break;
                    }
                    params.push(matches2[1] || matches2[2] || matches2[3]);
                }
            }
            parts.push({
                method: matches[1],
                params: params
            });
        }
    }
    // Check if we can retrieve the value from data item
    if (dataItem) {
        // Check values
        value = getTagValueFromObject(target, parts, dataItem._settings);
        // Check properties
        if (value == null || isObject(value)) { // isObject helps to solve problem with date axis, as for example dateX will get dateX from values object and won't get to the dateX date.
            value = getTagValueFromObject(target, parts, dataItem);
        }
        // Check data context
        let dataContext = dataItem.dataContext;
        if (value == null && dataContext) {
            value = getTagValueFromObject(target, parts, dataContext);
            // Maybe it's a literal dot-separated name of the key in dataContext?
            if (value == null) {
                value = getTagValueFromObject(target, [{
                        prop: tagName
                    }], dataContext);
            }
            // scond data context level sometimes exist (tree map)
            if (value == null && dataContext.dataContext) {
                value = getTagValueFromObject(target, parts, dataContext.dataContext);
            }
        }
        // Check component's data item
        if (value == null && dataItem.component && dataItem.component.dataItem !== dataItem) {
            value = getTagValue(dataItem.component, tagName);
        }
    }
    // Check sprite's properties
    if (value == null) {
        value = getTagValueFromObject(target, parts, target);
    }
    // Finally, check the parent
    if (value == null && target.parent) {
        value = getTagValue(target.parent, tagName);
    }
    return value;
}
/**
 * @ignore
 */
function getCustomDataValue(target, prop) {
    const customData = target.getPrivate("customData");
    if (isObject(customData)) {
        return customData[prop];
    }
}
/**
 * @ignore
 */
function getTagValueFromObject(target, parts, object, format) {
    let current = object;
    let formatApplied = false;
    for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];
        if (part.prop) {
            // Regular property
            if (current instanceof Sprite) {
                let tmp = current.get(part.prop);
                if (tmp == null)
                    tmp = current.getPrivate(part.prop);
                if (tmp == null)
                    tmp = getCustomDataValue(current, part.prop);
                if (tmp == null)
                    tmp = current[part.prop];
                current = tmp;
            }
            else if (current.get) {
                let tmp = current.get(part.prop);
                if (tmp == null)
                    tmp = current[part.prop];
                current = tmp;
            }
            else {
                current = current[part.prop];
            }
            if (current == null) {
                // Not set, return undefined
                return;
            }
        }
        else {
            // Method
            switch (part.method) {
                case "formatNumber":
                    let numberValue = toNumber(current);
                    if (numberValue != null) {
                        current = target.getNumberFormatter().format(numberValue, part.params[0] || undefined);
                        formatApplied = true;
                    }
                    break;
                case "formatDate":
                    let dateValue = toDate(current);
                    if (!isDate(dateValue) || isNaN$1(dateValue.getTime())) {
                        // Was not able to get date out of value, quitting and letting
                        // calling method try another value
                        return;
                    }
                    if (dateValue != null) {
                        current = target.getDateFormatter().format(dateValue, part.params[0] || undefined);
                        formatApplied = true;
                    }
                    break;
                case "formatDuration":
                    let durationValue = toNumber(current);
                    if (durationValue != null) {
                        current = target.getDurationFormatter().format(durationValue, part.params[0] || undefined, part.params[1] || undefined);
                        formatApplied = true;
                    }
                    break;
                case "urlEncode":
                case "encodeURIComponent":
                    current = encodeURIComponent(current);
                    break;
                default:
                    if (current[part.method]) {
                        current[part.method].apply(object, part.params);
                    }
                    break;
            }
        }
    }
    // Apply default format if it wasn't applied explicitly
    if (!formatApplied) {
        let formatParts = [{
                method: "",
                params: format
            }];
        {
            // Format is not set
            // Determine from the type of the value
            if (isNumber(current)) {
                formatParts[0].method = "formatNumber";
                formatParts[0].params = "";
            }
            else if (isDate(current)) {
                formatParts[0].method = "formatDate";
                formatParts[0].params = "";
            }
        }
        // Apply format
        if (formatParts[0].method) {
            current = getTagValueFromObject(target, formatParts, current);
        }
    }
    return current;
}

/**
 * A basic element that can have child elements, maintain their layout, and
 * have a background.
 *
 * It can have any [[Sprite]] element as a child, from very basic shapes, to
 * full-fledged charts.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/containers/} for more info
 * @important
 */
class Container extends Sprite {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_display", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeContainer()
        });
        Object.defineProperty(this, "_childrenDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeContainer()
        });
        /**
         * List of Container's child elements.
         */
        Object.defineProperty(this, "children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Children(this)
        });
        Object.defineProperty(this, "_percentageSizeChildren", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_percentagePositionChildren", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_prevWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_prevHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_contentWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_contentHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_contentMask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_vsbd0", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_vsbd1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_hsbd0", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_hsbd1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_childrenPrep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_childrenUpdt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _afterNew() {
        super._afterNew();
        this._display.addChild(this._childrenDisplay);
    }
    _afterChanged() {
        super._afterChanged();
        this._childrenPrep = false;
        this._childrenUpdt = false;
    }
    _dispose() {
        eachReverse(this.allChildren(), (child) => {
            child.dispose();
        });
        if (this.getPrivate("htmlElement")) {
            this._root._removeHTMLContent(this);
        }
        super._dispose();
    }
    _beforeChanged() {
        if (!this._childrenPrep) {
            this._prepareChildren();
        }
        if (!this._childrenUpdt) {
            this._updateChildren();
        }
        super._beforeChanged();
    }
    _changed() {
        super._changed();
        if (this.isDirty("interactiveChildren")) {
            this._display.interactiveChildren = this.get("interactiveChildren", false);
        }
        if (this.isDirty("layout")) {
            this._prevWidth = 0;
            this._prevHeight = 0;
            this.markDirtyBounds();
            if (this._prevSettings.layout) {
                this.children.each((child) => {
                    child.removePrivate("x");
                    child.removePrivate("y");
                });
            }
        }
        if (this.isDirty("paddingTop") || this.isDirty("paddingBottom") || this.isDirty("paddingLeft") || this.isDirty("paddingRight")) {
            this.children.each((child) => {
                child.markDirtyPosition();
            });
        }
        if (this.isDirty("maskContent")) {
            const childrenDisplay = this._childrenDisplay;
            let contentMask = this._contentMask;
            if (this.get("maskContent")) {
                if (!contentMask) {
                    contentMask = Rectangle.new(this._root, {
                        x: -0.5,
                        y: -0.5,
                        width: this.width() + 1,
                        height: this.height() + 1
                    });
                    this._contentMask = contentMask;
                    childrenDisplay.addChildAt(contentMask._display, 0);
                    childrenDisplay.mask = contentMask._display;
                }
            }
            else {
                if (contentMask) {
                    childrenDisplay.removeChild(contentMask._display);
                    childrenDisplay.mask = null;
                    contentMask.dispose();
                    this._contentMask = undefined;
                }
            }
        }
    }
    _updateSize() {
        super._updateSize();
        each$1(this._percentageSizeChildren, (child) => {
            child._updateSize();
        });
        each$1(this._percentagePositionChildren, (child) => {
            child.markDirtyPosition();
            child._updateSize();
        });
        this.updateBackground();
    }
    updateBackground() {
        const background = this.get("background");
        let bounds = this._localBounds;
        if (bounds && !this.isHidden()) {
            let x = bounds.left;
            let y = bounds.top;
            let w = bounds.right - x;
            let h = bounds.bottom - y;
            let maxWidth = this.get("maxWidth");
            let maxHeight = this.get("maxHeight");
            if (maxHeight) {
                if (h > maxHeight) {
                    h = maxHeight;
                }
            }
            if (maxWidth) {
                if (w > maxWidth) {
                    w = maxWidth;
                }
            }
            let width = this.width();
            let height = this.height();
            if (background) {
                background.setAll({ width: w, height: h, x: x, y: y });
                if (this._display.interactive) {
                    background._display.interactive = true;
                }
            }
            const contentMask = this._contentMask;
            if (contentMask) {
                contentMask.setAll({ width: width + 1, height: height + 1 });
            }
            const verticalScrollbar = this.get("verticalScrollbar");
            if (verticalScrollbar) {
                verticalScrollbar.set("height", height);
                verticalScrollbar.set("x", width - verticalScrollbar.width() - verticalScrollbar.get("marginRight", 0));
                let start = verticalScrollbar.get("start", 0);
                let end = verticalScrollbar.get("end", 1);
                if (start > 1 - end) {
                    verticalScrollbar.set("start", Math.max(0, end - height / this._contentHeight));
                }
                else {
                    verticalScrollbar.set("end", Math.min(1, start + height / this._contentHeight));
                }
                const bg = verticalScrollbar.get("background");
                if (bg) {
                    bg.setAll({ width: verticalScrollbar.width(), height: height });
                }
                let visible = true;
                if (this._contentHeight <= height) {
                    visible = false;
                }
                verticalScrollbar.setPrivate("visible", visible);
            }
        }
    }
    _applyThemes(force = false) {
        if (super._applyThemes(force)) {
            this.eachChildren((child) => {
                child._applyThemes(force);
            });
            return true;
        }
        else {
            return false;
        }
    }
    _applyState(name) {
        super._applyState(name);
        if (this.get("setStateOnChildren")) {
            this.eachChildren((child) => {
                child.states.apply(name);
            });
        }
    }
    _applyStateAnimated(name, duration) {
        super._applyStateAnimated(name, duration);
        if (this.get("setStateOnChildren")) {
            this.eachChildren((child) => {
                child.states.applyAnimate(name, duration);
            });
        }
    }
    /**
     * Returns container's inner width (width without padding) in pixels.
     *
     * @return Inner width (px)
     */
    innerWidth() {
        return this.width() - this.get("paddingRight", 0) - this.get("paddingLeft", 0);
    }
    /**
     * Returns container's inner height (height without padding) in pixels.
     *
     * @return Inner height (px)
     */
    innerHeight() {
        return this.height() - this.get("paddingTop", 0) - this.get("paddingBottom", 0);
    }
    _getBounds() {
        if (!this.get("html")) {
            let width = this.get("width");
            let height = this.get("height");
            let pWidth = this.getPrivate("width");
            let pHeight = this.getPrivate("height");
            let bounds = {
                left: 0,
                top: 0,
                right: this.width(),
                bottom: this.height()
            };
            let layout = this.get("layout");
            let horizontal = false;
            let vertical = false;
            if (layout instanceof HorizontalLayout || layout instanceof GridLayout) {
                horizontal = true;
            }
            if (layout instanceof VerticalLayout) {
                vertical = true;
            }
            if ((width != null || pWidth != null) && (height != null || pHeight != null) && !this.get("verticalScrollbar")) ;
            else {
                let m = Number.MAX_VALUE;
                let l = m;
                let r = -m;
                let t = m;
                let b = -m;
                const paddingLeft = this.get("paddingLeft", 0);
                const paddingTop = this.get("paddingTop", 0);
                const paddingRight = this.get("paddingRight", 0);
                const paddingBottom = this.get("paddingBottom", 0);
                this.children.each((child) => {
                    if (child.get("position") != "absolute" && child.get("isMeasured")) {
                        let childBounds = child.adjustedLocalBounds();
                        let childX = child.x();
                        let childY = child.y();
                        let cl = childX + childBounds.left;
                        let cr = childX + childBounds.right;
                        let ct = childY + childBounds.top;
                        let cb = childY + childBounds.bottom;
                        if (horizontal) {
                            cl -= child.get("marginLeft", 0);
                            cr += child.get("marginRight", 0);
                        }
                        if (vertical) {
                            ct -= child.get("marginTop", 0);
                            cb += child.get("marginBottom", 0);
                        }
                        if (cl < l) {
                            l = cl;
                        }
                        if (cr > r) {
                            r = cr;
                        }
                        if (ct < t) {
                            t = ct;
                        }
                        if (cb > b) {
                            b = cb;
                        }
                    }
                });
                if (l == m) {
                    l = 0;
                }
                if (r == -m) {
                    r = 0;
                }
                if (t == m) {
                    t = 0;
                }
                if (b == -m) {
                    b = 0;
                }
                bounds.left = l - paddingLeft;
                bounds.top = t - paddingTop;
                bounds.right = r + paddingRight;
                bounds.bottom = b + paddingBottom;
                const minWidth = this.get("minWidth");
                if (isNumber(minWidth) && minWidth > 0) {
                    if (bounds.right - bounds.left < minWidth) {
                        if (bounds.right >= minWidth) {
                            bounds.left = bounds.right - minWidth;
                        }
                        else {
                            bounds.right = bounds.left + minWidth;
                        }
                    }
                }
                const minHeight = this.get("minHeight");
                if (isNumber(minHeight) && minHeight > 0) {
                    if (bounds.bottom - bounds.top < minHeight) {
                        if (bounds.bottom >= minHeight) {
                            bounds.top = bounds.bottom - minHeight;
                        }
                        else {
                            bounds.bottom = bounds.top + minHeight;
                        }
                    }
                }
            }
            this._contentWidth = bounds.right - bounds.left;
            this._contentHeight = bounds.bottom - bounds.top;
            if (isNumber(width)) {
                bounds.left = 0;
                bounds.right = width;
            }
            if (isNumber(pWidth)) {
                bounds.left = 0;
                bounds.right = pWidth;
            }
            if (isNumber(height)) {
                bounds.top = 0;
                bounds.bottom = height;
            }
            if (isNumber(pHeight)) {
                bounds.top = 0;
                bounds.bottom = pHeight;
            }
            this._localBounds = bounds;
        }
        else {
            let bounds = this._localBounds;
            if (bounds) {
                this._contentWidth = bounds.right - bounds.left;
                this._contentHeight = bounds.bottom - bounds.top;
            }
        }
    }
    _updateBounds() {
        const layout = this.get("layout");
        if (layout) {
            layout.updateContainer(this);
        }
        super._updateBounds();
        this.updateBackground();
    }
    /**
     * @ignore
     */
    markDirty() {
        super.markDirty();
        this._root._addDirtyParent(this);
    }
    _prepareChildren() {
        this._childrenPrep = true;
        const innerWidth = this.innerWidth();
        const innerHeight = this.innerHeight();
        if (innerWidth != this._prevWidth || innerHeight != this._prevHeight) {
            let layout = this.get("layout");
            let horizontal = false;
            let vertical = false;
            if (layout) {
                if (layout instanceof HorizontalLayout || layout instanceof GridLayout) {
                    horizontal = true;
                }
                if (layout instanceof VerticalLayout) {
                    vertical = true;
                }
            }
            each$1(this._percentageSizeChildren, (child) => {
                if (!horizontal) {
                    let width = child.get("width");
                    if (width instanceof Percent) {
                        child.setPrivate("width", width.value * innerWidth);
                    }
                }
                if (!vertical) {
                    let height = child.get("height");
                    if (height instanceof Percent) {
                        child.setPrivate("height", height.value * innerHeight);
                    }
                }
            });
            each$1(this._percentagePositionChildren, (child) => {
                child.markDirtyPosition();
                child.markDirtyBounds();
            });
            this._prevWidth = innerWidth;
            this._prevHeight = innerHeight;
            this._sizeDirty = true;
            this.updateBackground();
        }
        //this._handleStates();
    }
    _updateHTMLContent() {
        const html = this.get("html", "");
        if (html && html !== "") {
            this._root._setHTMLContent(this, populateString(this, html));
        }
        else {
            this._root._removeHTMLContent(this);
        }
        this._root._positionHTMLElement(this);
    }
    /**
     * If scrolling is enabled on the Container (by adding `verticalScrollbar`)
     * the Container will scroll in such way so that target element becomes
     * visible if its currently outside of view.
     *
     * @param  child  Target child
     * @since 5.10.5
     */
    scrollToChild(child) {
        const verticalScrollbar = this.get("verticalScrollbar");
        if (verticalScrollbar) {
            let y = child.y();
            let h = this.innerHeight();
            let ch = child.height();
            let contentH = this._contentHeight;
            let max = 1 - (h - ch / 2) / contentH;
            if (y + ch * .7 + this._childrenDisplay.y > h || y - ch * .3 + this._childrenDisplay.y < 0) {
                let pos = Math.max(0, Math.min(max, (y - ch / 2) / contentH));
                verticalScrollbar.animate({ key: "start", to: pos, duration: verticalScrollbar.get("animationDuration", 0), easing: verticalScrollbar.get("animationEasing") });
            }
        }
    }
    _updateChildren() {
        this._childrenUpdt = true;
        if (this.isDirty("html")) {
            this._updateHTMLContent();
        }
        if (this.isDirty("verticalScrollbar")) {
            const verticalScrollbar = this.get("verticalScrollbar");
            if (verticalScrollbar) {
                verticalScrollbar._setParent(this);
                verticalScrollbar.startGrip.setPrivate("visible", false);
                verticalScrollbar.endGrip.setPrivate("visible", false);
                this.set("maskContent", true);
                this.set("paddingRight", verticalScrollbar.width() + verticalScrollbar.get("marginRight", 0) + verticalScrollbar.get("marginLeft", 0));
                let background = this.get("background");
                if (!background) {
                    background = this.set("background", Rectangle.new(this._root, {
                        themeTags: ["background"],
                        fillOpacity: 0,
                        fill: this._root.interfaceColors.get("alternativeBackground")
                    }));
                }
                this._vsbd0 = this.events.on("wheel", (event) => {
                    const wheelEvent = event.originalEvent;
                    // Ignore wheel event if it is happening on a non-chart element, e.g. if
                    // some page element is over the chart.
                    if (isLocalEvent(wheelEvent, this)) {
                        wheelEvent.preventDefault();
                    }
                    else {
                        return;
                    }
                    let shiftY = wheelEvent.deltaY / 5000;
                    const start = verticalScrollbar.get("start", 0);
                    const end = verticalScrollbar.get("end", 1);
                    if (start + shiftY <= 0) {
                        shiftY = -start;
                    }
                    if (end + shiftY >= 1) {
                        shiftY = 1 - end;
                    }
                    if (start + shiftY >= 0 && end + shiftY <= 1) {
                        verticalScrollbar.set("start", start + shiftY);
                        verticalScrollbar.set("end", end + shiftY);
                    }
                });
                this._disposers.push(this._vsbd0);
                this._vsbd1 = verticalScrollbar.events.on("rangechanged", () => {
                    let h = this._contentHeight;
                    const childrenDisplay = this._childrenDisplay;
                    const contentMask = this._contentMask;
                    childrenDisplay.y = -verticalScrollbar.get("start", 0) * h;
                    childrenDisplay.markDirtyLayer();
                    if (contentMask) {
                        contentMask._display.y = -childrenDisplay.y;
                        childrenDisplay.mask = contentMask._display;
                    }
                });
                this._disposers.push(this._vsbd1);
                this._display.addChild(verticalScrollbar._display);
            }
            else {
                const previous = this._prevSettings.verticalScrollbar;
                if (previous) {
                    this._display.removeChild(previous._display);
                    if (this._vsbd0) {
                        this._vsbd0.dispose();
                    }
                    if (this._vsbd1) {
                        this._vsbd1.dispose();
                    }
                    const childrenDisplay = this._childrenDisplay;
                    childrenDisplay.y = 0;
                    this.setPrivate("height", undefined);
                    this.set("maskContent", false);
                    this.set("paddingRight", undefined);
                }
            }
        }
        if (this.isDirty("background")) {
            // TODO maybe this should dispose ?
            const previous = this._prevSettings["background"];
            if (previous) {
                this._display.removeChild(previous._display);
            }
            const background = this.get("background");
            if (background instanceof Sprite) {
                background.set("isMeasured", false);
                background._setParent(this);
                this._display.addChildAt(background._display, 0);
            }
        }
        if (this.isDirty("mask")) {
            const mask = this.get("mask");
            const previous = this._prevSettings["mask"];
            if (previous) {
                this._display.removeChild(previous._display);
                if (previous != mask) {
                    previous.dispose();
                }
            }
            if (mask) {
                const parent = mask.parent;
                if (parent) {
                    parent.children.removeValue(mask);
                }
                mask._setParent(this);
                this._display.addChildAt(mask._display, 0);
                this._childrenDisplay.mask = mask._display;
            }
        }
    }
    _processTemplateField() {
        super._processTemplateField();
        this.children.each((child) => {
            child._processTemplateField();
        });
    }
    /**
     * @ignore
     */
    walkChildren(f) {
        this.children.each((child) => {
            if (child instanceof Container) {
                child.walkChildren(f);
            }
            f(child);
        });
    }
    eachChildren(f) {
        const background = this.get("background");
        if (background) {
            f(background);
        }
        const verticalScrollbar = this.get("verticalScrollbar");
        if (verticalScrollbar) {
            f(verticalScrollbar);
        }
        const mask = this.get("mask");
        if (mask) {
            f(mask);
        }
        this.children.values.forEach((child) => {
            f(child);
        });
    }
    allChildren() {
        const output = [];
        this.eachChildren((x) => {
            output.push(x);
        });
        return output;
    }
    _setDataItem(dataItem) {
        const updated = (dataItem !== this._dataItem);
        super._setDataItem(dataItem);
        const html = this.get("html", "");
        if (html && html !== "" && updated) {
            this._root._setHTMLContent(this, populateString(this, html));
        }
    }
    contentWidth() {
        return this._contentWidth;
    }
    contentHeight() {
        return this._contentHeight;
    }
}
Object.defineProperty(Container, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Container"
});
Object.defineProperty(Container, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Sprite.classNames.concat([Container.className])
});

/**
 * @ignore Text is an internal class. Use Label instead.
 */
class Text extends Sprite {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "textStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeTextStyle()
        });
        Object.defineProperty(this, "_display", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._root._renderer.makeText("", this.textStyle)
        });
        Object.defineProperty(this, "_textStyles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                "textAlign",
                "fontFamily",
                "fontSize",
                "fontStyle",
                "fontWeight",
                "fontStyle",
                "fontVariant",
                "textDecoration",
                "shadowColor",
                "shadowBlur",
                "shadowOffsetX",
                "shadowOffsetY",
                "shadowOpacity",
                // "leading",
                // "letterSpacing",
                "lineHeight",
                "baselineRatio",
                //"padding",
                // "stroke",
                // "strokeThickness",
                // "trim",
                // "wordWrap",
                "direction",
                "textBaseline",
                "oversizedBehavior",
                "breakWords",
                "ellipsis",
                "minScale",
                "maxChars"
            ]
        });
        Object.defineProperty(this, "_originalScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    _updateBounds() {
        if (!this.get("text")) {
            let newBounds = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            };
            this._adjustedLocalBounds = newBounds;
        }
        else {
            super._updateBounds();
            let fillGradient = this.get("fillGradient");
            if (fillGradient) {
                this._display.style.fill = fillGradient.getFill(this);
            }
        }
    }
    _changed() {
        super._changed();
        this._display.clear();
        let textStyle = this.textStyle;
        if (this.isDirty("opacity")) {
            let opacity = this.get("opacity", 1);
            this._display.alpha = opacity;
        }
        if (this.isDirty("text") || this.isDirty("populateText")) {
            this._display.text = this._getText();
            this.markDirtyBounds();
            if (this.get("role") == "tooltip") {
                this._root.updateTooltip(this);
            }
        }
        if (this.isPrivateDirty("tooltipElement")) {
            const tooltipElement = this.getPrivate("tooltipElement");
            if (tooltipElement) {
                this._disposers.push(new Disposer(() => {
                    this._root._removeTooltipElement(this);
                }));
            }
        }
        if (this.isDirty("width")) {
            textStyle.wordWrapWidth = this.width();
            this.markDirtyBounds();
        }
        if (this.isDirty("oversizedBehavior")) {
            textStyle.oversizedBehavior = this.get("oversizedBehavior", "none");
            this._display.invalidateVisibility();
            this.markDirtyBounds();
        }
        if (this.isDirty("breakWords")) {
            textStyle.breakWords = this.get("breakWords", false);
            this.markDirtyBounds();
        }
        if (this.isDirty("ellipsis")) {
            textStyle.ellipsis = this.get("ellipsis");
            this.markDirtyBounds();
        }
        if (this.isDirty("ignoreFormatting")) {
            textStyle.ignoreFormatting = this.get("ignoreFormatting", false);
            this.markDirtyBounds();
        }
        if (this.isDirty("minScale")) {
            textStyle.minScale = this.get("minScale", 0);
            this.markDirtyBounds();
        }
        if (this.isDirty("fill") || this.isDirty("fillGradient")) {
            const fill = this.get("fill");
            const fillGradient = this.get("fillGradient");
            const fillOpacity = this.get("fillOpacity");
            if (fillGradient) {
                if (fill) {
                    const stops = fillGradient.get("stops", []);
                    if (stops.length) {
                        each$1(stops, (stop) => {
                            if ((!stop.color || stop.colorInherited) && fill) {
                                stop.color = fill;
                                stop.colorInherited = true;
                            }
                            if (stop.opacity == null || stop.opacityInherited) {
                                stop.opacity = fillOpacity;
                                stop.opacityInherited = true;
                            }
                        });
                    }
                }
                textStyle.fill = fillGradient.getFill(this);
            }
            else if (fill) {
                textStyle.fill = fill;
            }
        }
        if (this.isDirty("fillOpacity")) {
            let fillOpacity = this.get("fillOpacity", 1);
            if (fillOpacity) {
                textStyle.fillOpacity = fillOpacity;
            }
        }
        if (this.isDirty("maxWidth") || this.isPrivateDirty("maxWidth")) {
            textStyle.maxWidth = this.get("maxWidth", this.getPrivate("maxWidth"));
            this.markDirtyBounds();
        }
        if (this.isDirty("maxHeight") || this.isPrivateDirty("maxHeight")) {
            textStyle.maxHeight = this.get("maxHeight", this.getPrivate("maxHeight"));
            this.markDirtyBounds();
        }
        each$1(this._textStyles, (styleName) => {
            if (this._dirty[styleName]) {
                textStyle[styleName] = this.get(styleName);
                this.markDirtyBounds();
            }
        });
        textStyle["fontSize"] = this.get("fontSize");
        textStyle["fontFamily"] = this.get("fontFamily");
        this._display.style = textStyle;
        if (this.isDirty("role") && this.get("role") == "tooltip") {
            this._root.updateTooltip(this);
        }
    }
    _getText() {
        let text = this.get("text", "");
        if (this.get("maxChars")) {
            text = truncateTextWithEllipsis(text, this.get("maxChars", 100000000), this.get("breakWords"), this.get("ellipsis"));
        }
        return this.get("populateText") ? populateString(this, text) : text;
    }
    _getAccessibleText() {
        const ariaLabel = this.get("ariaLabel");
        if (ariaLabel !== undefined) {
            return this.get("populateText") ? populateString(this, ariaLabel) : ariaLabel;
        }
        return this._getText();
    }
    /**
     * Forces the text to be re-evaluated and re-populated.
     */
    markDirtyText() {
        this._display.text = this._getText();
        if (this.get("role") == "tooltip") {
            this._root.updateTooltip(this);
        }
        this.markDirtyBounds();
        this.markDirty();
    }
    _setDataItem(dataItem) {
        super._setDataItem(dataItem);
        if (this.get("populateText")) {
            this.markDirtyText();
        }
    }
    getNumberFormatter() {
        if (this.parent) {
            return this.parent.getNumberFormatter();
        }
        else {
            return super.getNumberFormatter();
        }
    }
    getDateFormatter() {
        if (this.parent) {
            return this.parent.getDateFormatter();
        }
        else {
            return super.getDateFormatter();
        }
    }
    getDurationFormatter() {
        if (this.parent) {
            return this.parent.getDurationFormatter();
        }
        else {
            return super.getDurationFormatter();
        }
    }
}
Object.defineProperty(Text, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Text"
});
Object.defineProperty(Text, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Sprite.classNames.concat([Text.className])
});

/** @ignore */ /** */
/**
 * @ignore
 */
class Native {
    constructor() {
        Object.defineProperty(this, "_observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_targets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this._observer = new ResizeObserver((entries) => {
            each$1(entries, (entry) => {
                each$1(this._targets, (x) => {
                    if (x.target === entry.target) {
                        x.callback();
                    }
                });
            });
        });
    }
    addTarget(target, callback) {
        this._observer.observe(target, { box: "border-box" });
        this._targets.push({ target, callback });
    }
    removeTarget(target) {
        this._observer.unobserve(target);
        keepIf(this._targets, (x) => {
            return x.target !== target;
        });
    }
}
/**
 * @ignore
 */
class Raf {
    constructor() {
        Object.defineProperty(this, "_timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_targets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addTarget(target, callback) {
        if (this._timer === null) {
            let lastTime = null;
            const loop = () => {
                const currentTime = Date.now();
                if (lastTime === null || currentTime > (lastTime + Raf.delay)) {
                    lastTime = currentTime;
                    each$1(this._targets, (x) => {
                        let newSize = x.target.getBoundingClientRect();
                        if (newSize.width !== x.size.width || newSize.height !== x.size.height) {
                            x.size = newSize;
                            x.callback();
                        }
                    });
                }
                if (this._targets.length === 0) {
                    this._timer = null;
                }
                else {
                    this._timer = requestAnimationFrame(loop);
                }
            };
            this._timer = requestAnimationFrame(loop);
        }
        // We start off with fake bounds so that sensor always kicks in
        let size = { width: 0, height: 0, left: 0, right: 0, top: 0, bottom: 0, x: 0, y: 0 };
        this._targets.push({ target, callback, size });
    }
    removeTarget(target) {
        keepIf(this._targets, (x) => {
            return x.target !== target;
        });
        if (this._targets.length === 0) {
            if (this._timer !== null) {
                cancelAnimationFrame(this._timer);
                this._timer = null;
            }
        }
    }
}
Object.defineProperty(Raf, "delay", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 200
});
/**
 * @ignore
 */
let observer = null;
/**
 * @ignore
 */
function makeSensor() {
    if (observer === null) {
        if (typeof ResizeObserver !== "undefined") {
            observer = new Native();
        }
        else {
            observer = new Raf();
        }
    }
    return observer;
}
/**
 * @ignore
 */
class ResizeSensor {
    constructor(element, callback) {
        Object.defineProperty(this, "_sensor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_listener", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_disposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this._sensor = makeSensor();
        this._element = element;
        // This is needed because we need to know when the window is zoomed
        this._listener = onZoom(callback);
        this._sensor.addTarget(element, callback);
    }
    isDisposed() {
        return this._disposed;
    }
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._sensor.removeTarget(this._element);
            this._listener.dispose();
        }
    }
    get sensor() {
        return this._sensor;
    }
}

/**
 * Presets for common UI elements.
 */
class InterfaceColors extends Entity {
}
Object.defineProperty(InterfaceColors, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "InterfaceColors"
});
Object.defineProperty(InterfaceColors, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([InterfaceColors.className])
});

/**
 * Creates a label with support for in-line styling and data bindings.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/labels/} for more info
 */
class Label extends Container {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_text", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_textKeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                "text",
                "fill",
                "fillGradient",
                "fillOpacity",
                "textAlign",
                "fontFamily",
                "fontSize",
                "fontStyle",
                "fontWeight",
                "fontStyle",
                "fontVariant",
                "textDecoration",
                "shadowColor",
                "shadowBlur",
                "shadowOffsetX",
                "shadowOffsetY",
                "shadowOpacity",
                // "leading",
                // "letterSpacing",
                "lineHeight",
                "baselineRatio",
                //"padding",
                // "stroke",
                // "strokeThickness",
                // "trim",
                // "wordWrap",
                "direction",
                "textBaseline",
                "oversizedBehavior",
                "breakWords",
                "ellipsis",
                "minScale",
                "populateText",
                "role",
                "ignoreFormatting",
                "maxChars",
                "ariaLabel"
            ]
        });
    }
    /**
     * @ignore Text is not to be used directly
     */
    get text() {
        return this._text;
    }
    _afterNew() {
        super._afterNew();
        this._makeText();
        each$1(this._textKeys, (property) => {
            const propValue = this.get(property);
            if (propValue != undefined) {
                this._text.set(property, propValue);
            }
        });
        if (this.get("html", "") !== "") {
            this._text.set("text", "");
        }
        this.onPrivate("maxWidth", () => {
            this._setMaxDimentions();
        });
        this.onPrivate("maxHeight", () => {
            this._setMaxDimentions();
        });
    }
    _makeText() {
        this._text = this.children.push(Text.new(this._root, {}));
    }
    _updateChildren() {
        super._updateChildren();
        const text = this._text;
        each$1(this._textKeys, (property) => {
            this._text.set(property, this.get(property));
        });
        if (this.isDirty("maxWidth") || this.isDirty("maxHeight") || this.isDirty("rotation")) {
            this._setMaxDimentions();
        }
        // Do not show regular text if HTML is used
        if (this.get("html", "") !== "") {
            text.set("text", "");
        }
        else {
            text.set("text", this.get("text"));
            this._maybeUpdateHTMLColor();
        }
        if (this.isDirty("fill") || this.isDirty("fillGradient")) {
            this._maybeUpdateHTMLColor();
        }
        if (this.isDirty("textAlign") || this.isDirty("width")) {
            const textAlign = this.get("textAlign");
            let x;
            if (this.get("width") != null) {
                if (textAlign == "right") {
                    x = p100;
                }
                else if (textAlign == "center") {
                    x = p50;
                }
                else {
                    x = 0;
                }
            }
            else {
                if (textAlign == "left" || textAlign == "start") {
                    x = this.get("paddingLeft", 0);
                }
                else if (textAlign == "right" || textAlign == "end") {
                    x = -this.get("paddingRight", 0);
                }
            }
            text.set("x", x);
        }
        const background = this.get("background");
        if (background) {
            background.setPrivate("visible", text._display.textVisible);
        }
    }
    _maybeUpdateHTMLColor() {
        const htmlElement = this.getPrivate("htmlElement");
        if (htmlElement && this.get("fill")) {
            htmlElement.style.color = this.get("fill").toCSSHex();
            //@todo support gradient
        }
    }
    _setMaxDimentions() {
        const rotation = this.get("rotation");
        const vertical = rotation == 90 || rotation == 270 || rotation == -90;
        const text = this._text;
        const maxWidth = this.get("maxWidth", this.getPrivate("maxWidth", Infinity));
        if (isNumber(maxWidth)) {
            text.set(vertical ? "maxHeight" : "maxWidth", maxWidth - this.get("paddingTop", 0) - this.get("paddingBottom", 0));
        }
        else {
            text.set(vertical ? "maxHeight" : "maxWidth", undefined);
        }
        const maxHeight = this.get("maxHeight", this.getPrivate("maxHeight", Infinity));
        if (isNumber(maxHeight)) {
            text.set(vertical ? "maxWidth" : "maxHeight", maxHeight - this.get("paddingLeft", 0) - this.get("paddingRight", 0));
        }
        else {
            text.set(vertical ? "maxWidth" : "maxHeight", undefined);
        }
        this.root.events.once("frameended", () => {
            text.markDirtyBounds();
        });
    }
    _setDataItem(dataItem) {
        super._setDataItem(dataItem);
        this._markDirtyKey("text");
        this._markDirtyKey("html");
        const text = this._text;
        if (text.get("populateText")) {
            text.markDirtyText();
        }
        const html = this.get("html");
        if (html && html !== "") {
            this._updateHTMLContent();
        }
    }
    /**
     * Returns text with populated placeholders and formatting if `populateText` is
     * set to `true`.
     *
     * @return Populated text
     */
    getText() {
        return this._text._getText();
    }
    /**
     * Returns "aria-label" text with populated placeholders and formatting
     * if `populateText` is set to `true`.
     *
     * @return Populated text
     */
    getAccessibleText() {
        return this._text._getAccessibleText();
    }
}
Object.defineProperty(Label, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Label"
});
Object.defineProperty(Label, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Container.classNames.concat([Label.className])
});

/**
 * Draws a rectangle with a pointer.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 * @important
 */
class PointedRectangle extends Graphics {
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("pointerBaseWidth") || this.isDirty("cornerRadius") || this.isDirty("pointerLength") || this.isDirty("pointerX") || this.isDirty("pointerY") || this.isDirty("width") || this.isDirty("height")) {
            this._clear = true;
        }
    }
    _changed() {
        super._changed();
        if (this._clear) {
            this.markDirtyBounds();
            let w = this.width();
            let h = this.height();
            if (w > 0 && h > 0) {
                let cr = this.get("cornerRadius", 8);
                cr = fitToRange(cr, 0, Math.min(w / 2, h / 2));
                let x = this.get("pointerX", 0);
                let y = this.get("pointerY", 0);
                let bwh = this.get("pointerBaseWidth", 15) / 2;
                // corner coordinates
                // top left
                let xtl = 0;
                let ytl = 0;
                // top right
                let xtr = w;
                let ytr = 0;
                // bottom right
                let xbr = w;
                let ybr = h;
                // bottom left
                let xbl = 0;
                let ybl = h;
                // find stem base side: http://$math.stackexchange.com/questions/274712/calculate-on-which-side-of-straign-line-is-dot-located
                // d=(x−x1)(y2−y1)−(y−y1)(x2−x1)
                let d1 = (x - xtl) * (ybr - ytl) - (y - ytl) * (xbr - xtl);
                let d2 = (x - xbl) * (ytr - ybl) - (y - ybl) * (xtr - xbl);
                const display = this._display;
                // top
                display.moveTo(cr, 0);
                if (d1 > 0 && d2 > 0) {
                    let stemX = Math.round(fitToRange(x, cr + bwh, w - bwh - cr));
                    y = fitToRange(y, -Infinity, 0);
                    display.lineTo(stemX - bwh, 0);
                    display.lineTo(x, y);
                    display.lineTo(stemX + bwh, 0);
                }
                display.lineTo(w - cr, 0);
                display.arcTo(w, 0, w, cr, cr);
                // right
                if (d1 > 0 && d2 < 0) {
                    let stemY = Math.round(fitToRange(y, cr + bwh, h - bwh - cr));
                    x = fitToRange(x, w, Infinity);
                    display.lineTo(w, cr);
                    display.lineTo(w, Math.max(stemY - bwh, cr));
                    display.lineTo(x, y);
                    display.lineTo(w, stemY + bwh);
                }
                display.lineTo(w, h - cr);
                display.arcTo(w, h, w - cr, h, cr);
                // bottom
                if (d1 < 0 && d2 < 0) {
                    let stemX = Math.round(fitToRange(x, cr + bwh, w - bwh - cr));
                    y = fitToRange(y, h, Infinity);
                    display.lineTo(w - cr, h);
                    display.lineTo(stemX + bwh, h);
                    display.lineTo(x, y);
                    display.lineTo(stemX - bwh, h);
                }
                display.lineTo(cr, h);
                display.arcTo(0, h, 0, h - cr, cr);
                // left
                if (d1 < 0 && d2 > 0) {
                    let stemY = Math.round(fitToRange(y, cr + bwh, h - cr - bwh));
                    x = fitToRange(x, -Infinity, 0);
                    display.lineTo(0, h - cr);
                    display.lineTo(0, stemY + bwh);
                    display.lineTo(x, y);
                    display.lineTo(0, Math.max(stemY - bwh, cr));
                }
                display.lineTo(0, cr);
                display.arcTo(0, 0, cr, 0, cr);
                display.closePath();
            }
        }
    }
}
Object.defineProperty(PointedRectangle, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "PointedRectangle"
});
Object.defineProperty(PointedRectangle, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Graphics.classNames.concat([PointedRectangle.className])
});

/**
 * Creates a tooltip.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/tooltips/} for more info
 * @important
 */
class Tooltip extends Container {
    constructor(root, settings, isReal, templates = []) {
        super(root, settings, isReal, templates);
        Object.defineProperty(this, "_fx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_fy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fillDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fillGrDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_strokeDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_labelDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_keepHoverDp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_htmlContentHovered", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _afterNew() {
        this._settings.themeTags = mergeTags(this._settings.themeTags, ["tooltip"]);
        super._afterNew();
        const background = this._setDefaultFn("background", () => {
            return PointedRectangle.new(this._root, {});
        });
        background.set("themeTags", ["tooltip", "background"]);
        this._label = this.children.push(Label.new(this._root, {}));
        this._disposers.push(this._label.events.on("boundschanged", () => {
            this._updateBackground();
        }));
        this._disposers.push(this.on("bounds", () => {
            this._updateBackground();
        }));
        this._updateTextColor();
        this._root.tooltipContainer.children.push(this);
        this.hide(0);
        this._disposers.push(this.label.onPrivate("htmlElement", (htmlElement) => {
            if (htmlElement) {
                this._disposers.push(addEventListener(htmlElement, "pointerover", (_ev) => {
                    this._htmlContentHovered = true;
                }));
                this._disposers.push(addEventListener(htmlElement, "pointerout", (_ev) => {
                    this._htmlContentHovered = false;
                }));
            }
        }));
        this.on("visible", (_ev) => {
            this._handleReaderAnnouncement();
        });
        this.label.events.on("dataitemchanged", (_ev) => {
            this._handleReaderAnnouncement();
        });
        this._root._tooltips.push(this);
    }
    _handleReaderAnnouncement() {
        if (this.get("readerAnnounce") && this.isVisibleDeep()) {
            this._root.readerAlert(this.label.getAccessibleText());
        }
    }
    /**
     * A [[Label]] element for the tooltip.
     *
     * @readonly
     * @return Label
     */
    get label() {
        return this._label;
    }
    /**
     * Permanently disposes the tooltip.
     */
    _dispose() {
        super._dispose();
        remove(this._root._tooltips, this);
    }
    _updateChildren() {
        super._updateChildren();
        if (this.isDirty("pointerOrientation") || this.isPrivateDirty("minWidth") || this.isPrivateDirty("minHeight")) {
            this.get("background")._markDirtyKey("width");
        }
        const labelText = this.get("labelText");
        if (labelText != null) {
            this.label.set("text", this.get("labelText"));
        }
        const labelHTML = this.get("labelHTML");
        if (labelHTML != null) {
            this.label.set("html", this.get("labelHTML"));
        }
        const labelAriaLabel = this.get("labelAriaLabel");
        if (labelAriaLabel != null) {
            this.label.set("ariaLabel", this.get("labelAriaLabel"));
        }
    }
    _changed() {
        super._changed();
        if (this.isDirty("pointTo") || this.isDirty("pointerOrientation")) {
            // can't compare to previous, as sometimes pointTo is set twice (when pointer moves, so the position won't be udpated)
            this._updateBackground();
        }
        if (this.isDirty("tooltipTarget")) {
            this.updateBackgroundColor();
        }
        if (this.isDirty("keepTargetHover")) {
            const keephover = this.get("keepTargetHover");
            if (keephover) {
                const bg = this.get("background");
                this._keepHoverDp = new MultiDisposer([
                    bg.events.on("pointerover", (_ev) => {
                        let target = this.get("tooltipTarget");
                        if (target) {
                            if (target.parent && target.parent.getPrivate("tooltipTarget") == target) {
                                target = target.parent;
                            }
                            target.hover();
                        }
                    }),
                    bg.events.on("pointerout", (_ev) => {
                        let target = this.get("tooltipTarget");
                        if (target) {
                            if (target.parent && target.parent.getPrivate("tooltipTarget") == target) {
                                target = target.parent;
                            }
                            if (!this._htmlContentHovered) {
                                target.unhover();
                            }
                        }
                    })
                ]);
                this.label.onPrivate("htmlElement", (htmlElement) => {
                    if (this._keepHoverDp && htmlElement) {
                        this._keepHoverDp.disposers.push(addEventListener(htmlElement, "pointerleave", (ev) => {
                            const outEvent = this.root._renderer.getEvent(ev);
                            bg.events.dispatch("pointerout", {
                                type: "pointerout",
                                originalEvent: outEvent.event,
                                point: outEvent.point,
                                simulated: false,
                                target: bg
                            });
                        }));
                    }
                });
            }
            else {
                if (this._keepHoverDp) {
                    this._keepHoverDp.dispose();
                    this._keepHoverDp = undefined;
                }
            }
        }
    }
    _onShow() {
        super._onShow();
        this.updateBackgroundColor();
    }
    updateBackgroundColor() {
        let tooltipTarget = this.get("tooltipTarget");
        const background = this.get("background");
        let fill;
        let stroke;
        if (tooltipTarget && background) {
            fill = tooltipTarget.get("fill");
            stroke = tooltipTarget.get("stroke");
            if (fill == null) {
                fill = stroke;
            }
            if (this.get("getFillFromSprite")) {
                if (this._fillDp) {
                    this._fillDp.dispose();
                }
                if (fill != null) {
                    background.set("fill", fill);
                }
                this._fillDp = tooltipTarget.on("fill", (fill) => {
                    if (fill != null) {
                        background.set("fill", fill);
                        this._updateTextColor(fill);
                    }
                });
                this._disposers.push(this._fillDp);
            }
            if (this.get("getFillGradientFromSprite")) {
                if (this._fillGrDp) {
                    this._fillGrDp.dispose();
                }
                let fillGradient = tooltipTarget.get("fillGradient");
                if (fillGradient != null) {
                    background.set("fillGradient", fillGradient);
                }
                this._fillGrDp = tooltipTarget.on("fillGradient", (fillGradient) => {
                    if (fillGradient != null) {
                        background.set("fillGradient", fillGradient);
                    }
                });
                this._disposers.push(this._fillGrDp);
            }
            if (this.get("getStrokeFromSprite")) {
                if (this._strokeDp) {
                    this._strokeDp.dispose();
                }
                if (fill != null) {
                    background.set("stroke", fill);
                }
                this._strokeDp = tooltipTarget.on("fill", (fill) => {
                    if (fill != null) {
                        background.set("stroke", fill);
                    }
                });
                this._disposers.push(this._strokeDp);
            }
            if (this.get("getLabelFillFromSprite")) {
                if (this._labelDp) {
                    this._labelDp.dispose();
                }
                if (fill != null) {
                    this.label.set("fill", fill);
                }
                this._labelDp = tooltipTarget.on("fill", (fill) => {
                    if (fill != null) {
                        this.label.set("fill", fill);
                    }
                });
                this._disposers.push(this._labelDp);
            }
        }
        this._updateTextColor(fill);
    }
    _updateTextColor(fill) {
        if (this.get("autoTextColor")) {
            if (fill == null) {
                fill = this.get("background").get("fill");
            }
            if (fill == null) {
                fill = this._root.interfaceColors.get("background");
            }
            if (fill instanceof Color) {
                this.label.set("fill", Color.alternative(fill, this._root.interfaceColors.get("alternativeText"), this._root.interfaceColors.get("text")));
            }
        }
    }
    _setDataItem(dataItem) {
        super._setDataItem(dataItem);
        this.label._setDataItem(dataItem);
    }
    _updateBackground() {
        super.updateBackground();
        const parent = this._root.container;
        if (parent) {
            let cw = 0.5;
            let ch = 0.5;
            let centerX = this.get("centerX");
            if (centerX instanceof Percent) {
                cw = centerX.value;
            }
            let centerY = this.get("centerY");
            if (centerY instanceof Percent) {
                ch = centerY.value;
            }
            let parentW = parent.width();
            let parentH = parent.height();
            let tooltipContainer = this.parent;
            let xx = 0;
            let yy = 0;
            if (tooltipContainer) {
                xx = tooltipContainer.x();
                yy = tooltipContainer.y();
                const layerMargin = tooltipContainer.get("layerMargin");
                if (layerMargin) {
                    xx += layerMargin.left || 0;
                    yy += layerMargin.top || 0;
                    parentW += (layerMargin.left || 0) + (layerMargin.right || 0);
                    parentH += (layerMargin.top || 0) + (layerMargin.bottom || 0);
                }
            }
            const bounds = this.get("bounds", { left: -xx, top: -yy, right: parentW - xx, bottom: parentH - yy });
            this._updateBounds();
            let w = this.width();
            let h = this.height();
            // use old w and h,as when tooltip is hidden, these are 0 and unneeded animation happens
            if (w === 0) {
                w = this._w;
            }
            if (h === 0) {
                h = this._h;
            }
            let pointTo = this.get("pointTo", { x: parentW / 2, y: parentH / 2 });
            let x = pointTo.x;
            let y = pointTo.y;
            let pointerOrientation = this.get("pointerOrientation");
            let background = this.get("background");
            let pointerLength = 0;
            let bgStrokeSizeY = 0;
            let bgStrokeSizeX = 0;
            if (background instanceof PointedRectangle) {
                pointerLength = background.get("pointerLength", 0);
                bgStrokeSizeY = background.get("strokeWidth", 0) / 2;
                bgStrokeSizeX = bgStrokeSizeY;
                background.set("width", w);
                background.set("height", h);
            }
            let pointerX = 0;
            let pointerY = 0;
            let boundsW = bounds.right - bounds.left;
            let boundsH = bounds.bottom - bounds.top;
            // horizontal
            if (pointerOrientation == "horizontal" || pointerOrientation == "left" || pointerOrientation == "right") {
                bgStrokeSizeY = 0;
                if (pointerOrientation == "horizontal") {
                    if (x > bounds.left + boundsW / 2) {
                        x -= (w * (1 - cw) + pointerLength);
                        bgStrokeSizeX *= -1;
                    }
                    else {
                        x += (w * cw + pointerLength);
                    }
                }
                else if (pointerOrientation == "left") {
                    x += (w * (1 - cw) + pointerLength);
                }
                else {
                    x -= (w * cw + pointerLength);
                    bgStrokeSizeX *= -1;
                }
            }
            // vertical pointer
            else {
                bgStrokeSizeX = 0;
                if (pointerOrientation == "vertical") {
                    if (y > bounds.top + h / 2 + pointerLength) {
                        y -= (h * (1 - ch) + pointerLength);
                    }
                    else {
                        y += (h * ch + pointerLength);
                        bgStrokeSizeY *= -1;
                    }
                }
                else if (pointerOrientation == "down") {
                    y -= (h * (1 - ch) + pointerLength);
                }
                else {
                    y += (h * ch + pointerLength);
                    bgStrokeSizeY *= -1;
                }
            }
            x = fitToRange(x, bounds.left + w * cw, bounds.left + boundsW - w * (1 - cw)) + bgStrokeSizeX;
            y = fitToRange(y, bounds.top + h * ch, bounds.top + boundsH - h * (1 - ch)) - bgStrokeSizeY;
            pointerX = pointTo.x - x + w * cw + bgStrokeSizeX;
            pointerY = pointTo.y - y + h * ch - bgStrokeSizeY;
            this._fx = x;
            this._fy = y;
            const animationDuration = this.get("animationDuration", 0);
            if (animationDuration > 0 && this.get("visible") && this.get("opacity") > 0.1) {
                const animationEasing = this.get("animationEasing");
                this.animate({ key: "x", to: x, duration: animationDuration, easing: animationEasing });
                this.animate({ key: "y", to: y, duration: animationDuration, easing: animationEasing });
            }
            else {
                this.set("x", x);
                this.set("y", y);
            }
            if (background instanceof PointedRectangle) {
                background.set("pointerX", pointerX);
                background.set("pointerY", pointerY);
            }
            if (w > 0) {
                this._w = w;
            }
            if (h > 0) {
                this._h = h;
            }
        }
    }
}
Object.defineProperty(Tooltip, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Tooltip"
});
Object.defineProperty(Tooltip, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Container.classNames.concat([Tooltip.className])
});

/**
 * Number formatter
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-numbers/} for more info
 * @important
 */
class NumberFormatter extends Entity {
    _setDefaults() {
        // Defaults
        this._setDefault("negativeBase", 0);
        this._setDefault("numberFormat", "#,###.#####");
        this._setDefault("smallNumberThreshold", 1.00);
        const bns = "_big_number_suffix_";
        const sns = "_small_number_suffix_";
        const bs = "_byte_suffix_";
        this._setDefault("bigNumberPrefixes", [
            { "number": 1e+3, "suffix": this._t(bns + "3") },
            { "number": 1e+6, "suffix": this._t(bns + "6") },
            { "number": 1e+9, "suffix": this._t(bns + "9") },
            { "number": 1e+12, "suffix": this._t(bns + "12") },
            { "number": 1e+15, "suffix": this._t(bns + "15") },
            { "number": 1e+18, "suffix": this._t(bns + "18") },
            { "number": 1e+21, "suffix": this._t(bns + "21") },
            { "number": 1e+24, "suffix": this._t(bns + "24") }
        ]);
        this._setDefault("smallNumberPrefixes", [
            { "number": 1e-24, "suffix": this._t(sns + "24") },
            { "number": 1e-21, "suffix": this._t(sns + "21") },
            { "number": 1e-18, "suffix": this._t(sns + "18") },
            { "number": 1e-15, "suffix": this._t(sns + "15") },
            { "number": 1e-12, "suffix": this._t(sns + "12") },
            { "number": 1e-9, "suffix": this._t(sns + "9") },
            { "number": 1e-6, "suffix": this._t(sns + "6") },
            { "number": 1e-3, "suffix": this._t(sns + "3") }
        ]);
        this._setDefault("bytePrefixes", [
            { "number": 1, suffix: this._t(bs + "B") },
            { "number": 1024, suffix: this._t(bs + "KB") },
            { "number": 1048576, suffix: this._t(bs + "MB") },
            { "number": 1073741824, suffix: this._t(bs + "GB") },
            { "number": 1099511627776, suffix: this._t(bs + "TB") },
            { "number": 1125899906842624, suffix: this._t(bs + "PB") }
        ]);
        super._setDefaults();
    }
    _beforeChanged() {
        super._beforeChanged();
    }
    /**
     * Formats the number according to specific format.
     *
     * @param value   Value to format
     * @param format  Format to apply
     * @return Formatted number
     */
    format(value, format, precision) {
        // no format passed in or "Number"
        if (format == null || (isString(format) && format.toLowerCase() === "number")) {
            format = this.get("numberFormat", "");
        }
        // Init return value
        let formatted;
        // Cast to number just in case
        // TODO: maybe use better casting
        let source = Number(value);
        // Is it a built-in format or Intl.NumberFormatOptions
        if (isObject(format)) {
            try {
                if (this.get("intlLocales")) {
                    return new Intl.NumberFormat(this.get("intlLocales"), format).format(source);
                }
                else {
                    return new Intl.NumberFormat(undefined, format).format(source);
                }
            }
            catch (e) {
                return "Invalid";
            }
        }
        else {
            // Clean format
            format = cleanFormat(format);
            // Get format info (it will also deal with parser caching)
            let info = this.parseFormat(format, this._root.language);
            // format and replace the number
            let details;
            if (source > this.get("negativeBase")) {
                details = info.positive;
            }
            else if (source < this.get("negativeBase")) {
                details = info.negative;
            }
            else {
                details = info.zero;
            }
            // Adjust precision
            if (precision != null && !details.mod) {
                details = copy(details);
                details.decimals.active = source == 0 ? 0 : precision;
            }
            // Format
            formatted = details.template.split(PLACEHOLDER).join(this.applyFormat(source, details));
        }
        if (this.get("forceLTR") === true) {
            formatted = "‎" + formatted;
        }
        return formatted;
    }
    /**
     * Parses supplied format into structured object which can be used to format
     * the number.
     *
     * @param format Format string, i.e. "#,###.00"
     * @param language Language
     * @ignore
     */
    parseFormat(format, language) {
        // Check cache
        // TODO
        // let cached = this.getCache(format);
        // if (cached != null) {
        // 	return cached;
        // }
        const thousandSeparator = language.translateEmpty("_thousandSeparator");
        const decimalSeparator = language.translateEmpty("_decimalSeparator");
        // init format parse info holder
        let info = {
            "positive": {
                "thousands": {
                    "active": -1,
                    "passive": -1,
                    "interval": -1,
                    "separator": thousandSeparator
                },
                "decimals": {
                    "active": -1,
                    "passive": -1,
                    "separator": decimalSeparator
                },
                "template": "",
                "source": "",
                "parsed": false
            },
            "negative": {
                "thousands": {
                    "active": -1,
                    "passive": -1,
                    "interval": -1,
                    "separator": thousandSeparator
                },
                "decimals": {
                    "active": -1,
                    "passive": -1,
                    "separator": decimalSeparator
                },
                "template": "",
                "source": "",
                "parsed": false
            },
            "zero": {
                "thousands": {
                    "active": -1,
                    "passive": -1,
                    "interval": -1,
                    "separator": thousandSeparator
                },
                "decimals": {
                    "active": -1,
                    "passive": -1,
                    "separator": decimalSeparator
                },
                "template": "",
                "source": "",
                "parsed": false
            }
        };
        // Escape double vertical bars (that mean display one vertical bar)
        format = format.replace("||", PLACEHOLDER2);
        // Split it up and deal with different formats
        let parts = format.split("|");
        info.positive.source = parts[0];
        if (typeof parts[2] === "undefined") {
            info.zero = info.positive;
        }
        else {
            info.zero.source = parts[2];
        }
        if (typeof parts[1] === "undefined") {
            info.negative = info.positive;
        }
        else {
            info.negative.source = parts[1];
        }
        // Parse each
        each(info, (_part, item) => {
            // Already parsed
            if (item.parsed) {
                return;
            }
            // Check cached
            // TODO
            // if (typeof this.getCache(item.source) !== "undefined") {
            // 	info[part] = this.getCache(item.source);
            // 	return;
            // }
            // Begin parsing
            let partFormat = item.source;
            // Just "Number"?
            if (partFormat.toLowerCase() === "number") {
                partFormat = this.get("numberFormat", "#,###.#####");
            }
            // Let TextFormatter split into chunks
            let chunks = TextFormatter.chunk(partFormat, true);
            for (let i = 0; i < chunks.length; i++) {
                let chunk = chunks[i];
                // replace back double vertical bar
                chunk.text = chunk.text.replace(PLACEHOLDER2, "|");
                if (chunk.type === "value") {
                    // Parse format
                    // Look for codes
                    let matches = chunk.text.match(/[#0.,]+[ ]?[abespABESP%!]?[abespABESP‰!]?/);
                    if (matches) {
                        if (matches === null || matches[0] === "") {
                            // no codes here - assume string
                            // nothing to do here
                            item.template += chunk.text;
                        }
                        else {
                            // look for the format modifiers at the end
                            let mods = matches[0].match(/[abespABESP%‰!]{2}|[abespABESP%‰]{1}$/);
                            if (mods) {
                                item.mod = mods[0].toLowerCase();
                                item.modSpacing = matches[0].match(/[ ]{1}[abespABESP%‰!]{1}$/) ? true : false;
                            }
                            // break the format up
                            let a = matches[0].split(".");
                            // Deal with thousands
                            if (a[0] === "") ;
                            else {
                                // Counts
                                item.thousands.active = (a[0].match(/0/g) || []).length;
                                item.thousands.passive = (a[0].match(/\#/g) || []).length + item.thousands.active;
                                // Separator interval
                                let b = a[0].split(",");
                                if (b.length === 1) ;
                                else {
                                    // Use length fo the last chunk as thousands length
                                    item.thousands.interval = (b.pop() || "").length;
                                    if (item.thousands.interval === 0) {
                                        item.thousands.interval = -1;
                                    }
                                }
                            }
                            // Deal with decimals
                            if (typeof (a[1]) === "undefined") ;
                            else {
                                // Counts
                                item.decimals.active = (a[1].match(/0/g) || []).length;
                                item.decimals.passive = (a[1].match(/\#/g) || []).length + item.decimals.active;
                            }
                            // Add special code to template
                            item.template += chunk.text.split(matches[0]).join(PLACEHOLDER);
                        }
                    }
                }
                else {
                    // Quoted string - take it as it is
                    item.template += chunk.text;
                }
            }
            // Apply style formatting
            //item.template = getTextFormatter().format(item.template, this.outputFormat);
            // Save cache
            // TODO
            //this.setCache(item.source, item);
            // Mark this as parsed
            item.parsed = true;
        });
        // Save cache (the whole thing)
        // TODO
        //this.setCache(format, info);
        return info;
    }
    /**
     * Applies parsed format to a numeric value.
     *
     * @param value    Value
     * @param details  Parsed format as returned by parseFormat()
     * @return Formatted number
     * @ignore
     */
    applyFormat(value, details) {
        // Use absolute values
        let negative = value < 0;
        value = Math.abs(value);
        // Recalculate according to modifier
        let prefix = "", suffix = "";
        let mods = details.mod ? details.mod.split("") : [];
        if (mods.indexOf("b") !== -1) {
            let a = this.applyPrefix(value, this.get("bytePrefixes"), mods.indexOf("!") !== -1);
            value = a[0];
            prefix = a[1];
            suffix = a[2];
            if (details.modSpacing) {
                suffix = " " + suffix;
            }
        }
        else if (mods.indexOf("a") !== -1) {
            let a = this.applyPrefix(value, value < this.get("smallNumberThreshold") ? this.get("smallNumberPrefixes") : this.get("bigNumberPrefixes"), mods.indexOf("!") !== -1);
            value = a[0];
            prefix = a[1];
            suffix = a[2];
            if (details.modSpacing) {
                suffix = " " + suffix;
            }
        }
        else if (mods.indexOf("p") !== -1) {
            let ol = Math.min(value.toString().length + 2, 21);
            //value *= 100;
            value = parseFloat(value.toPrecision(ol));
            prefix = this._root.language.translate("_percentPrefix");
            suffix = this._root.language.translate("_percentSuffix");
            if (prefix == "" && suffix == "") {
                suffix = "%";
            }
        }
        else if (mods.indexOf("%") !== -1) {
            let ol = Math.min(value.toString().length + 2, 21);
            value *= 100;
            value = parseFloat(value.toPrecision(ol));
            suffix = "%";
        }
        else if (mods.indexOf("‰") !== -1) {
            let ol = Math.min(value.toString().length + 3, 21);
            value *= 1000;
            value = parseFloat(value.toPrecision(ol));
            suffix = "‰";
        }
        // Round to passive
        if (mods.indexOf("e") !== -1) {
            // convert the value to exponential
            let exp;
            if (details.decimals.passive >= 0) {
                exp = value.toExponential(details.decimals.passive).split("e");
            }
            else {
                exp = value.toExponential().split("e");
            }
            value = Number(exp[0]);
            suffix = "e" + exp[1];
            if (details.modSpacing) {
                suffix = " " + suffix;
            }
        }
        else if (details.decimals.passive === 0) {
            value = Math.round(value);
        }
        else if (details.decimals.passive > 0) {
            const decimals = decimalPlaces(value);
            if (decimals > 0) {
                const d = Math.pow(10, details.decimals.passive);
                value = Math.round(parseFloat((value * d).toFixed(decimals))) / d;
            }
        }
        // Init return value
        let res = "";
        // Calc integer and decimal parts
        let a = numberToString(value).split(".");
        // Format integers
        let ints = a[0];
        // Pad integers to active length
        if (ints.length < details.thousands.active) {
            ints = Array(details.thousands.active - ints.length + 1).join("0") + ints;
        }
        // Insert thousands separators
        if (details.thousands.interval > 0) {
            let ip = [];
            let intsr = ints.split("").reverse().join("");
            for (let i = 0, len = ints.length; i <= len; i += details.thousands.interval) {
                let c = intsr.substr(i, details.thousands.interval).split("").reverse().join("");
                if (c !== "") {
                    ip.unshift(c);
                }
            }
            ints = ip.join(details.thousands.separator);
        }
        // Add integers
        res += ints;
        // Add decimals
        if (a.length === 1) {
            a.push("");
        }
        let decs = a[1];
        // Fill zeros?
        if (decs.length < details.decimals.active) {
            decs += Array(details.decimals.active - decs.length + 1).join("0");
        }
        if (decs !== "") {
            res += details.decimals.separator + decs;
        }
        // Can't have empty return value
        if (res === "") {
            res = "0";
        }
        // Add minus sign back
        if (value !== 0 && negative && (mods.indexOf("s") === -1)) {
            res = "-" + res;
        }
        // Add suffixes/prefixes
        if (prefix) {
            res = prefix + res;
        }
        if (suffix) {
            res += suffix;
        }
        return res;
    }
    applyPrefix(value, prefixes, force = false) {
        let newvalue = value;
        let prefix = "";
        let suffix = "";
        let applied = false;
        let k = 1;
        for (let i = 0, len = prefixes.length; i < len; i++) {
            if (prefixes[i].number <= value) {
                if (prefixes[i].number === 0) {
                    newvalue = 0;
                }
                else {
                    newvalue = value / prefixes[i].number;
                    k = prefixes[i].number;
                }
                prefix = prefixes[i].prefix;
                suffix = prefixes[i].suffix;
                applied = true;
            }
        }
        if (!applied && force && prefixes.length && value != 0) {
            // Prefix was not applied. Use the first prefix.
            newvalue = value / prefixes[0].number;
            prefix = prefixes[0].prefix;
            suffix = prefixes[0].suffix;
            applied = true;
        }
        if (applied) {
            newvalue = parseFloat(newvalue.toPrecision(Math.min(k.toString().length + Math.floor(newvalue).toString().replace(/[^0-9]*/g, "").length, 21)));
        }
        return [newvalue, prefix, suffix];
    }
    /**
     * Replaces brackets with temporary placeholders.
     *
     * @ignore Exclude from docs
     * @param text  Input text
     * @return Escaped text
     */
    escape(text) {
        return text.replace("||", PLACEHOLDER2);
    }
    /**
     * Replaces placeholders back to brackets.
     *
     * @ignore Exclude from docs
     * @param text  Escaped text
     * @return Unescaped text
     */
    unescape(text) {
        return text.replace(PLACEHOLDER2, "|");
    }
}

function parseDate(timezone, date) {
    let year = 0;
    let month = 0;
    let day = 1;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let millisecond = 0;
    let weekday = 0;
    timezone.formatToParts(date).forEach((x) => {
        switch (x.type) {
            case "year":
                year = +x.value;
                break;
            case "month":
                month = (+x.value) - 1;
                break;
            case "day":
                day = +x.value;
                break;
            case "hour":
                hour = +x.value;
                break;
            case "minute":
                minute = +x.value;
                break;
            case "second":
                second = +x.value;
                break;
            case "fractionalSecond":
                millisecond = +x.value;
                break;
            case "weekday":
                switch (x.value) {
                    case "Sun":
                        weekday = 0;
                        break;
                    case "Mon":
                        weekday = 1;
                        break;
                    case "Tue":
                        weekday = 2;
                        break;
                    case "Wed":
                        weekday = 3;
                        break;
                    case "Thu":
                        weekday = 4;
                        break;
                    case "Fri":
                        weekday = 5;
                        break;
                    case "Sat":
                        weekday = 6;
                        break;
                }
        }
    });
    if (hour === 24) {
        hour = 0;
    }
    return { year, month, day, hour, minute, second, millisecond, weekday };
}
function toUTCDate(timezone, date) {
    const { year, month, day, hour, minute, second, millisecond } = parseDate(timezone, date);
    return Date.UTC(year, month, day, hour, minute, second, millisecond);
}
class Timezone {
    constructor(timezone, isReal) {
        Object.defineProperty(this, "_utc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dtf", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!isReal) {
            throw new Error("You cannot use `new Class()`, instead use `Class.new()`");
        }
        this.name = timezone;
        this._utc = new Intl.DateTimeFormat("en-US", {
            hour12: false,
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            weekday: "short",
            fractionalSecondDigits: 3,
        });
        this._dtf = new Intl.DateTimeFormat("en-US", {
            hour12: false,
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            weekday: "short",
            fractionalSecondDigits: 3,
        });
    }
    /**
     * Use this method to create an instance of this class.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/#New_element_syntax} for more info
     * @param   timezone  IANA timezone
     * @return            Instantiated object
     */
    static new(timezone) {
        return (new this(timezone, true));
    }
    convertLocal(date) {
        const offset = this.offsetUTC(date);
        const userOffset = date.getTimezoneOffset();
        const output = new Date(date);
        output.setUTCMinutes(output.getUTCMinutes() - (offset - userOffset));
        const newUserOffset = output.getTimezoneOffset();
        if (userOffset != newUserOffset) {
            output.setUTCMinutes(output.getUTCMinutes() + newUserOffset - userOffset);
        }
        return output;
    }
    offsetUTC(date) {
        const utc = toUTCDate(this._utc, date);
        const dtf = toUTCDate(this._dtf, date);
        return (utc - dtf) / 60000;
    }
    parseDate(date) {
        return parseDate(this._dtf, date);
    }
}

/**
 * Date formatter class.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-dates/} for more info
 * @important
 */
class DateFormatter extends Entity {
    _setDefaults() {
        // Defaults
        this._setDefault("capitalize", true);
        this._setDefault("dateFormat", "yyyy-MM-dd");
        super._setDefaults();
    }
    _beforeChanged() {
        super._beforeChanged();
    }
    /**
     * Formats a source `Date` object into string format
     * @param   source          inpout date
     * @param   format          Output format
     * @param   ignoreTimezone  Ignore timezone?
     * @return                  Formatted date
     */
    format(source, format, ignoreTimezone = false) {
        // Locale?
        // TODO
        // No format passed in or it's empty
        if (typeof format === "undefined" || format === "") {
            format = this.get("dateFormat", "yyyy-MM-dd");
        }
        // Init return value
        let formatted;
        // Cast?
        // TODO: decide if we need to cast
        let date = source;
        // Is it a built-in format or Intl.DateTimeFormat
        if (isObject(format)) {
            try {
                const locales = this.get("intlLocales");
                if (locales) {
                    return new Intl.DateTimeFormat(locales, format).format(date);
                }
                else {
                    return new Intl.DateTimeFormat(undefined, format).format(date);
                }
            }
            catch (e) {
                return "Invalid";
            }
        }
        // get format info (it will also deal with parser caching)
        let info = this.parseFormat(format);
        // Should we apply custom time zone?
        const timezone = this._root.timezone;
        let originalDate = date;
        if (timezone && !this._root.utc && !ignoreTimezone) {
            date = timezone.convertLocal(date);
        }
        // Check if it's a valid date
        if (!isNumber(date.getTime())) {
            // TODO translation
            //return this._t("Invalid date");
            return "Invalid date";
        }
        // Apply format
        formatted = this.applyFormat(date, info, ignoreTimezone, originalDate);
        // Capitalize
        if (this.get("capitalize")) {
            formatted = formatted.replace(/^.{1}/, formatted.substr(0, 1).toUpperCase());
        }
        // We're done
        return formatted;
    }
    /**
     * Applies format to Date.
     *
     * @param date      Date object
     * @param info      Parsed format information
     * @return Formatted date string
     */
    applyFormat(date, info, ignoreTimezone = false, originalDate) {
        // Init return value
        let res = info.template;
        // Get values
        let fullYear, month, weekday, day, hours, minutes, seconds, milliseconds, timestamp = date.getTime();
        if (this._root.utc && !ignoreTimezone) {
            fullYear = date.getUTCFullYear();
            month = date.getUTCMonth();
            weekday = date.getUTCDay();
            day = date.getUTCDate();
            hours = date.getUTCHours();
            minutes = date.getUTCMinutes();
            seconds = date.getUTCSeconds();
            milliseconds = date.getUTCMilliseconds();
        }
        else {
            fullYear = date.getFullYear();
            month = date.getMonth();
            weekday = date.getDay();
            day = date.getDate();
            hours = date.getHours();
            minutes = date.getMinutes();
            seconds = date.getSeconds();
            milliseconds = date.getMilliseconds();
        }
        // Go through each part and format/replace it in template
        for (let i = 0, len = info.parts.length; i < len; i++) {
            let value = "";
            switch (info.parts[i]) {
                case "G":
                    value = this._t(fullYear < 0
                        ? "_era_bc"
                        : "_era_ad");
                    break;
                case "yyyy":
                    value = Math.abs(fullYear).toString();
                    if (fullYear < 0) {
                        value += this._t("_era_bc");
                    }
                    break;
                case "yyy":
                case "yy":
                case "y":
                    value = Math.abs(fullYear).toString().substr(-info.parts[i].length);
                    if (fullYear < 0) {
                        value += this._t("_era_bc");
                    }
                    break;
                case "YYYY":
                case "YYY":
                case "YY":
                case "Y":
                    let year = getWeekYear(date, this._root.utc);
                    if (info.parts[i] == "YYYY") {
                        value = Math.abs(year).toString();
                    }
                    else {
                        value = Math.abs(year).toString().substr(-info.parts[i].length);
                    }
                    if (year < 0) {
                        value += this._t("_era_bc");
                    }
                    break;
                case "u":
                    // @todo
                    break;
                case "q":
                    value = "" + Math.ceil((date.getMonth() + 1) / 3);
                    break;
                case "MMMMM":
                    value = this._t(this._getMonth(month)).substr(0, 1);
                    break;
                case "MMMM":
                    value = this._t(this._getMonth(month));
                    break;
                case "MMM":
                    value = this._t(this._getShortMonth(month));
                    break;
                case "MM":
                    value = padString(month + 1, 2, "0");
                    break;
                case "M":
                    value = (month + 1).toString();
                    break;
                case "ww":
                    value = padString(getWeek(date, this._root.utc), 2, "0");
                    break;
                case "w":
                    value = getWeek(date, this._root.utc).toString();
                    break;
                case "W":
                    value = getMonthWeek(date, this._root.utc).toString();
                    break;
                case "dd":
                    value = padString(day, 2, "0");
                    break;
                case "d":
                    value = day.toString();
                    break;
                case "DD":
                case "DDD":
                    value = padString(getYearDay(date, this._root.utc).toString(), info.parts[i].length, "0");
                    break;
                case "D":
                    value = getYearDay(date, this._root.utc).toString();
                    break;
                case "F":
                    // @todo
                    break;
                case "g":
                    // @todo
                    break;
                case "t":
                    value = this._root.language.translateFunc("_dateOrd").call(this, day);
                    break;
                case "E":
                    value = (weekday || 7).toString();
                    break;
                case "EE":
                    value = padString((weekday || 7).toString(), 2, "0");
                    break;
                case "EEE":
                case "eee":
                    value = this._t(this._getShortWeekday(weekday));
                    break;
                case "EEEE":
                case "eeee":
                    value = this._t(this._getWeekday(weekday));
                    break;
                case "EEEEE":
                case "eeeee":
                    value = this._t(this._getShortWeekday(weekday)).substr(0, 1);
                    break;
                case "e":
                case "ee":
                    value = (weekday - (this._root.locale.firstDayOfWeek || 1) + 1).toString();
                    if (info.parts[i] == "ee") {
                        value = padString(value, 2, "0");
                    }
                    break;
                case "a":
                    if (hours >= 12) {
                        value = this._t("PM");
                    }
                    else {
                        value = this._t("AM");
                    }
                    break;
                case "aa":
                    if (hours >= 12) {
                        value = this._t("P.M.");
                    }
                    else {
                        value = this._t("A.M.");
                    }
                    break;
                case "aaa":
                    if (hours >= 12) {
                        value = this._t("P");
                    }
                    else {
                        value = this._t("A");
                    }
                    break;
                case "h":
                    value = get12Hours(hours).toString();
                    break;
                case "hh":
                    value = padString(get12Hours(hours), 2, "0");
                    break;
                case "H":
                    value = hours.toString();
                    break;
                case "HH":
                    value = padString(hours, 2, "0");
                    break;
                case "K":
                    value = get12Hours(hours, 0).toString();
                    break;
                case "KK":
                    value = padString(get12Hours(hours, 0), 2, "0");
                    break;
                case "k":
                    value = (hours + 1).toString();
                    break;
                case "kk":
                    value = padString(hours + 1, 2, "0");
                    break;
                case "m":
                    value = minutes.toString();
                    break;
                case "mm":
                    value = padString(minutes, 2, "0");
                    break;
                case "s":
                    value = seconds.toString();
                    break;
                case "ss":
                    value = padString(seconds, 2, "0");
                    break;
                case "S":
                case "SS":
                case "SSS":
                    value = Math.round((milliseconds / 1000) * Math.pow(10, info.parts[i].length)).toString();
                    break;
                case "x":
                    value = timestamp.toString();
                    break;
                case "n":
                case "nn":
                case "nnn":
                    value = padString(milliseconds, info.parts[i].length, "0");
                    break;
                case "z":
                    value = getTimeZone(originalDate || date, false, false, this._root.utc, this._root.timezone ? this._root.timezone.name : undefined).replace(/[+-]+[0-9]+$/, "");
                    break;
                case "zz":
                    value = getTimeZone(originalDate || date, true, false, this._root.utc, this._root.timezone ? this._root.timezone.name : undefined);
                    break;
                case "zzz":
                    value = getTimeZone(originalDate || date, false, true, this._root.utc, this._root.timezone ? this._root.timezone.name : undefined).replace(/[+-]+[0-9]+$/, "");
                    break;
                case "zzzz":
                    value = getTimeZone(originalDate || date, true, true, this._root.utc, this._root.timezone ? this._root.timezone.name : undefined);
                    break;
                case "Z":
                case "ZZ":
                    let timezone = this._root.utc ? "UTC" : this._root.timezone;
                    if (timezone instanceof Timezone) {
                        timezone = timezone.name;
                    }
                    const offset = timezone ? getTimezoneOffset(timezone, originalDate || date) : date.getTimezoneOffset();
                    let tz = Math.abs(offset) / 60;
                    let tzh = Math.floor(tz);
                    let tzm = tz * 60 - tzh * 60;
                    if (this._root.utc) {
                        tzh = 0;
                        tzm = 0;
                    }
                    if (info.parts[i] == "Z") {
                        value = "GMT";
                        value += offset > 0 ? "-" : "+";
                        value += padString(tzh, 2) + ":" + padString(tzm, 2);
                    }
                    else {
                        value = offset > 0 ? "-" : "+";
                        value += padString(tzh, 2) + padString(tzm, 2);
                    }
                    break;
                case "i":
                    value = date.toISOString();
                    break;
                case "I":
                    value = date.toUTCString();
                    break;
            }
            res = res.replace(PLACEHOLDER, value);
        }
        return res;
    }
    /**
     * Parses format into structured infromation.
     *
     * @param format Format template
     */
    parseFormat(format) {
        // Check cache
        // TODO: implement caching of the parsed format
        // Init format parse info holder
        let info = {
            "template": "",
            "parts": []
        };
        // Let TextFormatter split into chunks
        let chunks = TextFormatter.chunk(format, true);
        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i];
            if (chunk.type === "value") {
                // Just "Date"?
                if (chunk.text.match(/^date$/i)) {
                    let dateFormat = this.get("dateFormat", "yyyy-MM-dd");
                    if (!isString(dateFormat)) {
                        dateFormat = "yyyy-MM-dd";
                    }
                    chunk.text = dateFormat;
                }
                // Find all possible parts
                let matches = chunk.text.match(/G|yyyy|yyy|yy|y|YYYY|YYY|YY|Y|u|q|MMMMM|MMMM|MMM|MM|M|ww|w|W|dd|d|DDD|DD|D|F|g|EEEEE|EEEE|EEE|EE|E|eeeee|eeee|eee|ee|e|aaa|aa|a|hh|h|HH|H|KK|K|kk|k|mm|m|ss|s|SSS|SS|S|A|zzzz|zzz|zz|z|ZZ|Z|t|x|nnn|nn|n|i|I/g);
                // Found?
                if (matches) {
                    // Populate template
                    for (let x = 0; x < matches.length; x++) {
                        info.parts.push(matches[x]);
                        chunk.text = chunk.text.replace(matches[x], PLACEHOLDER);
                    }
                }
            }
            // Apply to template
            info.template += chunk.text;
        }
        // Save cache
        // TODO
        return info;
    }
    _months() {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    }
    _getMonth(index) {
        return this._months()[index];
    }
    _shortMonths() {
        return ["Jan", "Feb", "Mar", "Apr", "May(short)", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
    _getShortMonth(index) {
        return this._shortMonths()[index];
    }
    _weekdays() {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    }
    _getWeekday(index) {
        return this._weekdays()[index];
    }
    _shortWeekdays() {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }
    _getShortWeekday(index) {
        return this._shortWeekdays()[index];
    }
    parse(source, format, utc) {
        // If UTC is not supplied, use Root setting
        if (typeof utc === "undefined") {
            utc = this._root.utc;
        }
        // Is it already a Date
        if (source instanceof Date) {
            return source;
        }
        // Is it a numeric timestamp
        if (isNumber(source)) {
            return new Date(source);
        }
        // Are we parsing a timestamp?
        if (format == "x") {
            return new Date(parseInt(source));
        }
        // No? Let's check if it's string, and try converting to it if nec
        if (!isString(source)) {
            source = source.toString();
        }
        // Init return value
        let res;
        // Init RegEx for parsing
        let reg = "";
        // Clean format
        format = cleanFormat(format);
        // Clip format to length of the source string
        format = format.substr(0, source.length);
        // Parse format
        let info = this.parseFormat(format);
        // Init parsed items holder
        let parsedIndexes = {
            "year": -1,
            "year3": -1,
            "year2": -1,
            "year1": -1,
            "month": -1,
            "monthShort": -1,
            "monthLong": -1,
            "weekdayShort": -1,
            "weekdayLong": -1,
            "day": -1,
            "yearDay": -1,
            "week": -1,
            "hourBase0": -1,
            "hour12Base0": -1,
            "hourBase1": -1,
            "hour12Base1": -1,
            "minute": -1,
            "second": -1,
            "millisecond": -1,
            "millisecondDigits": -1,
            "am": -1,
            "zone": -1,
            "timestamp": -1,
            "iso": -1
        };
        // Init values
        let resValues = {
            "year": 1970,
            "month": 0,
            "day": 1,
            "hour": 0,
            "minute": 0,
            "second": 0,
            "millisecond": 0,
            "timestamp": null,
            "offset": 0,
            "utc": utc
        };
        // Index adjuster
        let indexAdjust = 0;
        let index = 0;
        // Iterate through all of the parts
        for (let i = 0; i < info.parts.length; i++) {
            // Set current match index
            index = i + indexAdjust + 1;
            switch (info.parts[i]) {
                case "yyyy":
                case "YYYY":
                    reg += "([0-9]{4})";
                    parsedIndexes.year = index;
                    break;
                case "yyy":
                case "YYY":
                    reg += "([0-9]{3})";
                    parsedIndexes.year3 = index;
                    break;
                case "yy":
                case "YY":
                    reg += "([0-9]{2})";
                    parsedIndexes.year2 = index;
                    break;
                case "y":
                case "Y":
                    reg += "([0-9]{1})";
                    parsedIndexes.year1 = index;
                    break;
                case "MMMM":
                    reg += "(" + this.getStringList(this._months()).join("|") + ")";
                    parsedIndexes.monthLong = index;
                    break;
                case "MMM":
                    reg += "(" + this.getStringList(this._shortMonths()).join("|") + ")";
                    parsedIndexes.monthShort = index;
                    break;
                case "MM":
                case "M":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.month = index;
                    break;
                case "ww":
                case "w":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.week = index;
                    break;
                case "dd":
                case "d":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.day = index;
                    break;
                case "DDD":
                case "DD":
                case "D":
                    reg += "([0-9]{3}|[0-9]{2}|[0-9]{1})";
                    parsedIndexes.yearDay = index;
                    break;
                case "dddd":
                    reg += "(" + this.getStringList(this._weekdays()).join("|") + ")";
                    parsedIndexes.weekdayLong = index;
                    break;
                case "ddd":
                    reg += "(" + this.getStringList(this._shortWeekdays()).join("|") + ")";
                    parsedIndexes.weekdayShort = index;
                    break;
                case "aaa":
                case "aa":
                case "a":
                    // TODO: fix (escape regex)
                    reg += "(" + this.getStringList(["AM", "PM", "A\.M\.", "P\.M\.", "A", "P"]).join("|") + ")";
                    parsedIndexes.am = index;
                    break;
                case "hh":
                case "h":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.hour12Base1 = index;
                    break;
                case "HH":
                case "H":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.hourBase0 = index;
                    break;
                case "KK":
                case "K":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.hour12Base0 = index;
                    break;
                case "kk":
                case "k":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.hourBase1 = index;
                    break;
                case "mm":
                case "m":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.minute = index;
                    break;
                case "ss":
                case "s":
                    reg += "([0-9]{2}|[0-9]{1})";
                    parsedIndexes.second = index;
                    break;
                case "SSS":
                case "SS":
                case "S":
                    reg += "([0-9]{3}|[0-9]{2}|[0-9]{1})";
                    parsedIndexes.millisecond = index;
                    parsedIndexes.millisecondDigits = info.parts[i].length;
                    break;
                case "nnn":
                case "nn":
                case "n":
                    reg += "([0-9]{3}|[0-9]{2}|[0-9]{1})";
                    parsedIndexes.millisecond = index;
                    break;
                case "x":
                    reg += "([0-9]{1,})";
                    parsedIndexes.timestamp = index;
                    break;
                case "Z":
                    reg += "GMT([-+]+[0-9]{2}:[0-9]{2})";
                    parsedIndexes.zone = index;
                    break;
                case "ZZ":
                    reg += "([\\-+]+[0-9]{2}[0-9]{2})";
                    parsedIndexes.zone = index;
                    break;
                case "i":
                    reg += "([0-9]{4})-?([0-9]{2})-?([0-9]{2})T?([0-9]{2}):?([0-9]{2}):?([0-9]{2})\\.?([0-9]{0,3})([zZ]|[+\\-][0-9]{2}:?[0-9]{2}|$)";
                    parsedIndexes.iso = index;
                    indexAdjust += 7;
                    break;
                case "G":
                case "YYYY":
                case "YYY":
                case "YY":
                case "Y":
                case "MMMMM":
                case "W":
                case "EEEEE":
                case "EEEE":
                case "EEE":
                case "EE":
                case "E":
                case "eeeee":
                case "eeee":
                case "eee":
                case "ee":
                case "e":
                case "zzzz":
                case "zzz":
                case "zz":
                case "z":
                case "t":
                    // Ignore
                    indexAdjust--;
                    break;
            }
            reg += "[^0-9]*";
        }
        // Try matching
        let regex = new RegExp(reg);
        let matches = source.match(regex);
        if (matches) {
            // Populate the date object
            // Full year
            if (parsedIndexes.year > -1) {
                resValues.year = parseInt(matches[parsedIndexes.year]);
            }
            // 3-digit year
            if (parsedIndexes.year3 > -1) {
                let val = parseInt(matches[parsedIndexes.year3]);
                val += 1000;
                resValues.year = val;
            }
            // 2-digit year
            if (parsedIndexes.year2 > -1) {
                let val = parseInt(matches[parsedIndexes.year2]);
                if (val > 50) {
                    val += 1000;
                }
                else {
                    val += 2000;
                }
                resValues.year = val;
            }
            // 1-digit year
            if (parsedIndexes.year1 > -1) {
                let val = parseInt(matches[parsedIndexes.year1]);
                val = Math.floor((new Date().getFullYear()) / 10) * 10 + val;
                resValues.year = val;
            }
            // Full month
            if (parsedIndexes.monthLong > -1) {
                resValues.month = this.resolveMonth(matches[parsedIndexes.monthLong]);
            }
            // Short month
            if (parsedIndexes.monthShort > -1) {
                resValues.month = this.resolveShortMonth(matches[parsedIndexes.monthShort]);
            }
            // Numeric month
            if (parsedIndexes.month > -1) {
                resValues.month = parseInt(matches[parsedIndexes.month]) - 1;
            }
            // Weekday
            // @todo
            // Week
            if ((parsedIndexes.week > -1) && (parsedIndexes.day === -1)) {
                // We parse weeks ONLY if day is not explicitly set
                // TODO: this needs work
                // (but maybe later - I can hardly imagine anyone passing their dates in weeks)
                resValues.month = 0;
                resValues.day = getDayFromWeek(parseInt(matches[parsedIndexes.week]), resValues.year, 1, utc);
            }
            // Day
            if (parsedIndexes.day > -1) {
                resValues.day = parseInt(matches[parsedIndexes.day]);
            }
            // Year day
            if (parsedIndexes.yearDay > -1) {
                resValues.month = 0;
                resValues.day = parseInt(matches[parsedIndexes.yearDay]);
            }
            // 24 Hour (0-23)
            if (parsedIndexes.hourBase0 > -1) {
                resValues.hour = parseInt(matches[parsedIndexes.hourBase0]);
            }
            // 24 Hour (1-24)
            if (parsedIndexes.hourBase1 > -1) {
                resValues.hour = parseInt(matches[parsedIndexes.hourBase1]) - 1;
            }
            // 12 Hour (0-11)
            if (parsedIndexes.hour12Base0 > -1) {
                let val = parseInt(matches[parsedIndexes.hour12Base0]);
                if (val == 11) {
                    val = 0;
                }
                if ((parsedIndexes.am > -1) && !this.isAm(matches[parsedIndexes.am])) {
                    val += 12;
                }
                resValues.hour = val;
            }
            // 12 Hour (1-12)
            if (parsedIndexes.hour12Base1 > -1) {
                let val = parseInt(matches[parsedIndexes.hour12Base1]);
                if (val == 12) {
                    val = 0;
                }
                if ((parsedIndexes.am > -1) && !this.isAm(matches[parsedIndexes.am])) {
                    val += 12;
                }
                resValues.hour = val;
            }
            // Minute
            if (parsedIndexes.minute > -1) {
                resValues.minute = parseInt(matches[parsedIndexes.minute]);
            }
            // Second
            if (parsedIndexes.second > -1) {
                resValues.second = parseInt(matches[parsedIndexes.second]);
            }
            // Millisecond
            if (parsedIndexes.millisecond > -1) {
                let val = parseInt(matches[parsedIndexes.millisecond]);
                if (parsedIndexes.millisecondDigits == 2) {
                    val *= 10;
                }
                else if (parsedIndexes.millisecondDigits == 1) {
                    val *= 100;
                }
                resValues.millisecond = val;
            }
            // Timestamp
            if (parsedIndexes.timestamp > -1) {
                resValues.timestamp = parseInt(matches[parsedIndexes.timestamp]);
                const ts = new Date(resValues.timestamp);
                resValues.year = ts.getUTCFullYear();
                resValues.month = ts.getUTCMonth();
                resValues.day = ts.getUTCDate();
                resValues.hour = ts.getUTCHours();
                resValues.minute = ts.getUTCMinutes();
                resValues.second = ts.getUTCSeconds();
                resValues.millisecond = ts.getUTCMilliseconds();
            }
            // Adjust time zone
            if (parsedIndexes.zone > -1) {
                resValues.offset = this.resolveTimezoneOffset(new Date(resValues.year, resValues.month, resValues.day), matches[parsedIndexes.zone]);
            }
            // ISO
            if (parsedIndexes.iso > -1) {
                resValues.year = toNumber(matches[parsedIndexes.iso + 0]);
                resValues.month = toNumber(matches[parsedIndexes.iso + 1]) - 1;
                resValues.day = toNumber(matches[parsedIndexes.iso + 2]);
                resValues.hour = toNumber(matches[parsedIndexes.iso + 3]);
                resValues.minute = toNumber(matches[parsedIndexes.iso + 4]);
                resValues.second = toNumber(matches[parsedIndexes.iso + 5]);
                resValues.millisecond = toNumber(matches[parsedIndexes.iso + 6]);
                if (matches[parsedIndexes.iso + 7] == "Z" || matches[parsedIndexes.iso + 7] == "z") {
                    resValues.utc = true;
                }
                else if (matches[parsedIndexes.iso + 7] != "") {
                    resValues.offset = this.resolveTimezoneOffset(new Date(resValues.year, resValues.month, resValues.day), matches[parsedIndexes.iso + 7]);
                }
            }
            // Create Date object
            if (resValues.utc) {
                res = new Date(Date.UTC(resValues.year, resValues.month, resValues.day, resValues.hour, resValues.minute, resValues.second, resValues.millisecond));
            }
            else {
                res = new Date(resValues.year, resValues.month, resValues.day, resValues.hour, resValues.minute + resValues.offset, resValues.second, resValues.millisecond);
            }
        }
        else {
            // Didn't match anything
            // Let's try dropping it into Date constructor and hope for the best
            res = new Date(source);
        }
        return res;
    }
    resolveTimezoneOffset(date, zone) {
        let value = zone.match(/([+\-]?)([0-9]{2}):?([0-9]{2})/);
        if (value) {
            let match = zone.match(/([+\-]?)([0-9]{2}):?([0-9]{2})/);
            let dir = match[1];
            let hour = match[2];
            let minute = match[3];
            let offset = parseInt(hour) * 60 + parseInt(minute);
            // Adjust offset
            // Making it negative does not seem to make sense, but it's right
            // because of how JavaScript calculates GMT offsets
            if (dir == "+") {
                offset *= -1;
            }
            // Check the difference in offset
            let originalOffset = (date || new Date()).getTimezoneOffset();
            let diff = offset - originalOffset;
            return diff;
        }
        return 0;
    }
    /**
     * Resolves month name (i.e. "December") into a month number (11).
     *
     * @param value  Month name
     * @return Month number
     */
    resolveMonth(value) {
        // Let's try English first
        let month = this._months().indexOf(value);
        if (month > -1) {
            return month;
        }
        // Try the translation
        if (!this._root.language.isDefault()) {
            month = this._root.language.translateAll(this._months()).indexOf(value);
            if (month > -1) {
                return month;
            }
        }
        return 0;
    }
    /**
     * Resolves short month name (i.e. "Dec") into a month number.
     *
     * @param value  Short month name
     * @return Month number
     */
    resolveShortMonth(value) {
        // Let's try English first
        let month = this._shortMonths().indexOf(value);
        if (month > -1) {
            return month;
        }
        // Maybe long month (workaround for May)
        month = this._months().indexOf(value);
        if (month > -1) {
            return month;
        }
        // Try the translation
        if (this._root.language && !this._root.language.isDefault()) {
            month = this._root.language.translateAll(this._shortMonths()).indexOf(value);
            if (month > -1) {
                return month;
            }
        }
        return 0;
    }
    /**
     * Checks if passed in string represents AM/PM notation in many of its
     * versions.
     *
     * @param value  Source string
     * @return Is it AM/PM?
     */
    isAm(value) {
        let list = this.getStringList(["AM", "A.M.", "A"]);
        return list.indexOf(value.toUpperCase()) > -1;
    }
    /**
     * Translates list of strings.
     *
     * @param list  Source strings
     * @return Translated strings
     */
    getStringList(list) {
        let res = [];
        for (let i = 0; i < list.length; i++) {
            // translate?
            if (this._root.language) {
                res.push(escapeForRgex(this._t(list[i])));
            }
            else {
                res.push(escapeForRgex(list[i]));
            }
        }
        return res;
    }
}

/**
 * A class used to format numberic values as time duration.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-durations/} for more info
 */
class DurationFormatter extends Entity {
    constructor() {
        super(...arguments);
        /**
         * Collection of aliases for units.
         */
        Object.defineProperty(this, "_unitAliases", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                "Y": "y",
                "D": "d",
                "H": "h",
                "K": "h",
                "k": "h",
                "n": "S"
            }
        });
    }
    _setDefaults() {
        const dmillisecond = "_duration_millisecond";
        const dsecond = "_duration_second";
        const dminute = "_duration_minute";
        const dhour = "_duration_hour";
        const dday = "_duration_day";
        const dweek = "_duration_week";
        const dmonth = "_duration_month";
        const dyear = "_duration_year";
        const asecond = "_second";
        const aminute = "_minute";
        const ahour = "_hour";
        const aday = "_day";
        const aweek = "_week";
        const amonth = "_week";
        const ayear = "_year";
        // Defaults
        this._setDefault("negativeBase", 0);
        this._setDefault("baseUnit", "second");
        this._setDefault("durationFormats", {
            "millisecond": {
                "millisecond": this._t(dmillisecond),
                "second": this._t((dmillisecond + asecond)),
                "minute": this._t((dmillisecond + aminute)),
                "hour": this._t((dmillisecond + ahour)),
                "day": this._t((dmillisecond + aday)),
                "week": this._t((dmillisecond + aweek)),
                "month": this._t((dmillisecond + amonth)),
                "year": this._t((dmillisecond + ayear))
            },
            "second": {
                "second": this._t((dsecond)),
                "minute": this._t((dsecond + aminute)),
                "hour": this._t((dsecond + ahour)),
                "day": this._t((dsecond + aday)),
                "week": this._t((dsecond + aweek)),
                "month": this._t((dsecond + amonth)),
                "year": this._t((dsecond + ayear))
            },
            "minute": {
                "minute": this._t((dminute)),
                "hour": this._t((dminute + ahour)),
                "day": this._t((dminute + aday)),
                "week": this._t((dminute + aweek)),
                "month": this._t((dminute + amonth)),
                "year": this._t((dminute + ayear))
            },
            "hour": {
                "hour": this._t((dhour)),
                "day": this._t((dhour + aday)),
                "week": this._t((dhour + aweek)),
                "month": this._t((dhour + amonth)),
                "year": this._t((dhour + ayear))
            },
            "day": {
                "day": this._t((dday)),
                "week": this._t((dday + aweek)),
                "month": this._t((dday + amonth)),
                "year": this._t((dday + ayear))
            },
            "week": {
                "week": this._t((dweek)),
                "month": this._t((dweek + amonth)),
                "year": this._t((dweek + ayear))
            },
            "month": {
                "month": this._t((dmonth)),
                "year": this._t((dmonth + ayear))
            },
            "year": {
                "year": this._t(dyear)
            }
        });
        super._setDefaults();
    }
    _beforeChanged() {
        super._beforeChanged();
    }
    /**
     * Formats the number as duration.
     *
     * For example `1000` (base unit seconds) would be converted to `16:40` as in
     * 16 minutes and 40 seconds.
     *
     * @param value   Value to format
     * @param format  Format to apply
     * @param base    Override base unit
     * @return Formatted number
     */
    format(value, format, base) {
        // no base unit?
        let baseUnit = base || this.get("baseUnit");
        // no format passed in or empty
        if (typeof format === "undefined" || format === "") {
            if (this.get("durationFormat") != null) {
                format = this.get("durationFormat");
            }
            else {
                format = this.getFormat(toNumber(value), undefined, baseUnit);
            }
        }
        // Clean format
        format = cleanFormat(format);
        // get format info (it will also deal with parser caching)
        let info = this.parseFormat(format, baseUnit);
        // cast to number just in case
        // TODO: maybe use better casting
        let source = Number(value);
        // format and replace the number
        let details;
        if (source > this.get("negativeBase")) {
            details = info.positive;
        }
        else if (source < this.get("negativeBase")) {
            details = info.negative;
        }
        else {
            details = info.zero;
        }
        // Format
        let formatted = this.applyFormat(source, details);
        // Apply color?
        if (details.color !== "") {
            formatted = "[" + details.color + "]" + formatted + "[/]";
        }
        return formatted;
    }
    /**
     * Parses supplied format into structured object which can be used to format
     * the number.
     *
     * @param format  Format string, i.e. "#,###.00"
     * @param base    Override base unit
     * @return Parsed information
     */
    parseFormat(format, base) {
        // Check cache
        // TODO
        // let cached = this.getCache(format);
        // if (cached != null) {
        // 	return cached;
        // }
        // no base unit?
        let baseUnit = base || this.get("baseUnit");
        // Initialize duration parsing info
        let info = {
            "positive": {
                "color": "",
                "template": "",
                "parts": [],
                "source": "",
                "baseUnit": baseUnit,
                "parsed": false,
                "absolute": false
            },
            "negative": {
                "color": "",
                "template": "",
                "parts": [],
                "source": "",
                "baseUnit": baseUnit,
                "parsed": false,
                "absolute": false
            },
            "zero": {
                "color": "",
                "template": "",
                "parts": [],
                "source": "",
                "baseUnit": baseUnit,
                "parsed": false,
                "absolute": false
            }
        };
        // Escape double vertical bars (that mean display one vertical bar)
        format = format.replace("||", PLACEHOLDER2);
        // Split it up and deal with different formats
        let parts = format.split("|");
        info.positive.source = parts[0];
        if (typeof parts[2] === "undefined") {
            info.zero = info.positive;
        }
        else {
            info.zero.source = parts[2];
        }
        if (typeof parts[1] === "undefined") {
            info.negative = info.positive;
        }
        else {
            info.negative.source = parts[1];
        }
        // Parse each
        each(info, (_part, item) => {
            // Already parsed
            if (item.parsed) {
                return;
            }
            // Check cached
            // TODO
            // if (typeof this.getCache(item.source) !== "undefined") {
            // 	info[part] = this.getCache(item.source);
            // 	return;
            // }
            // Begin parsing
            let partFormat = item.source;
            // Check for [] directives
            let dirs = [];
            dirs = item.source.match(/^\[([^\]]*)\]/);
            if (dirs && dirs.length && dirs[0] !== "") {
                partFormat = item.source.substr(dirs[0].length);
                item.color = dirs[1];
            }
            // Let TextFormatter split into chunks
            let chunks = TextFormatter.chunk(partFormat, true);
            for (let i = 0; i < chunks.length; i++) {
                let chunk = chunks[i];
                // replace back double vertical bar
                chunk.text = chunk.text.replace(PLACEHOLDER2, "|");
                if (chunk.type === "value") {
                    // Just "Duration"?
                    // if (chunk.text.toLowerCase() === "duration") {
                    // 	chunk.text = durationFormat;
                    // }
                    // Check for "a" (absolute) modifier
                    if (chunk.text.match(/[yYMdDwhHKkmsSn]+a/)) {
                        item.absolute = true;
                        chunk.text = chunk.text.replace(/([yYMdDwhHKkmsSn]+)a/, "$1");
                    }
                    // Find all possible parts
                    let matches = chunk.text.match(/y+|Y+|M+|d+|D+|w+|h+|H+|K+|k+|m+|s+|S+|n+/g);
                    if (matches) {
                        // Populate template
                        for (let x = 0; x < matches.length; x++) {
                            // Is it an alias?
                            if (matches[x] == null) {
                                matches[x] = this._unitAliases[matches[x]];
                            }
                            item.parts.push(matches[x]);
                            chunk.text = chunk.text.replace(matches[x], PLACEHOLDER);
                        }
                    }
                }
                // Apply to template
                item.template += chunk.text;
            }
            // Apply style formatting
            //item.template = TextFormatter.format(item.template, this.outputFormat);
            // Save cache
            // TODO
            //this.setCache(item.source, item);
            // Mark this as parsed
            item.parsed = true;
        });
        // Save cache (the whole thing)
        // TODO
        //this.setCache(format, info);
        return info;
    }
    /**
     * Applies parsed format to a numeric value.
     *
     * @param value    Value
     * @param details  Parsed format as returned by {parseFormat}
     * @return Formatted duration
     */
    applyFormat(value, details) {
        // Use absolute values
        let negative = !details.absolute && (value < this.get("negativeBase"));
        value = Math.abs(value);
        // Recalculate to milliseconds
        let tstamp = this.toTimeStamp(value, details.baseUnit);
        // Init return value
        let res = details.template;
        const values = {
            millisecond: 0,
            second: 0,
            minute: 0,
            hour: 0,
            day: 0,
            week: 0,
            month: 0,
            year: 0
        };
        // Iterate through duration parts
        for (let i = 0, len = details.parts.length; i < len; i++) {
            // Gather the part
            let part = details.parts[i];
            let unit = this._toTimeUnit(part.substr(0, 1));
            // Calculate current unit value
            let ints;
            const unitValue = this._getUnitValue(unit);
            if (i < (len - 1)) {
                ints = Math.floor(tstamp / unitValue);
            }
            else {
                ints = Math.round(tstamp / unitValue);
            }
            values[unit] += ints;
            // Reduce timestamp
            tstamp -= ints * unitValue;
        }
        // Check if we have full unit that we need to bump up to higher unit
        each(values, (unit, value) => {
            if (unit == "millisecond" && value == 1000) {
                values["second"]++;
                values["millisecond"] = 0;
            }
            else if (unit == "second" && value == 60) {
                values["minute"]++;
                values["second"] = 0;
            }
            else if (unit == "minute" && value == 60) {
                values["hour"]++;
                values["minute"] = 0;
            }
            else if (unit == "hour" && value == 24) {
                values["day"]++;
                values["hour"] = 0;
            }
            else if (unit == "day" && value == 7 && details.parts.indexOf("w") !== -1) {
                values["week"]++;
                values["day"] = 0;
            }
            else if (unit == "day" && value == 30) {
                values["month"]++;
                values["day"] = 0;
            }
            else if (unit == "month" && value == 12) {
                values["year"]++;
                values["month"] = 0;
            }
            // if (val > 0) {
            // 	res = res.replace($type.PLACEHOLDER, $utils.padString(val, 2, "0"));
            // }
            // else {
            // 	res = res.replace($type.PLACEHOLDER, "");
            // }
        });
        // Iterate again
        for (let i = 0, len = details.parts.length; i < len; i++) {
            // Gather the part
            let part = details.parts[i];
            let unit = this._toTimeUnit(part.substr(0, 1));
            let digits = part.length;
            // Calculate current unit value
            res = res.replace(PLACEHOLDER, padString(values[unit], digits, "0"));
        }
        // Reapply negative sign
        if (negative) {
            res = "-" + res;
        }
        return res;
    }
    /**
     * Converts numeric value to timestamp in milliseconds.
     *
     * @param value     A source value
     * @param baseUnit  Base unit the source value is in: "q", "s", "i", "h", "d", "w", "m", "y"
     * @return Value representation as a timestamp in milliseconds
     */
    toTimeStamp(value, baseUnit) {
        return value * this._getUnitValue(baseUnit);
    }
    _toTimeUnit(code) {
        switch (code) {
            case "S":
                return "millisecond";
            case "s":
                return "second";
            case "m":
                return "minute";
            case "h":
                return "hour";
            case "d":
                return "day";
            case "w":
                return "week";
            case "M":
                return "month";
            case "y":
                return "year";
        }
    }
    /**
     * Returns appropriate default format for the value.
     *
     * If `maxValue` is sepcified, it will use that value to determine the time
     * unit for the format.
     *
     * For example if your `baseUnit` is `"second"` and you pass in `10`, you
     * will get `"10"`.
     *
     * However, you might want it to be formatted in the context of bigger scale,
     * say 10 minutes (600 seconds). If you pass in `600` as `maxValue`, all
     * values, including small ones will use format with minutes, e.g.:
     * `00:10`, `00:50`, `12: 30`, etc.
     *
     * @param value     Value to format
     * @param maxValue  Maximum value to be used to determine format
     * @param baseUnit  Base unit of the value
     * @return Format
     */
    getFormat(value, maxValue, baseUnit) {
        // Is format override set?
        if (this.get("durationFormat") != null) {
            return this.get("durationFormat");
        }
        // Get base unit
        if (!baseUnit) {
            baseUnit = this.get("baseUnit");
        }
        if (maxValue != null && value != maxValue) {
            value = Math.abs(value);
            maxValue = Math.abs(maxValue);
            let maxUnit = this.getValueUnit(Math.max(value, maxValue), baseUnit);
            return this.get("durationFormats")[baseUnit][maxUnit];
        }
        else {
            let unit = this.getValueUnit(value, baseUnit);
            return this.get("durationFormats")[baseUnit][unit];
        }
    }
    /**
     * Returns value's closest denominator time unit, e.g 100 seconds is
     * `"minute"`, while 59 seconds would still be `second`.
     *
     * @param value     Source duration value
     * @param baseUnit  Base unit
     * @return Denominator
     */
    getValueUnit(value, baseUnit) {
        // Get base unit
        if (!baseUnit) {
            baseUnit = this.get("baseUnit");
        }
        // Convert to milliseconds
        let currentUnit;
        let ms = this.getMilliseconds(value, baseUnit);
        eachContinue(this._getUnitValues(), (key, val) => {
            if (key == baseUnit || currentUnit) {
                let num = ms / val;
                if (num <= 1) {
                    if (!currentUnit) {
                        currentUnit = key;
                    }
                    return false;
                }
                currentUnit = key;
            }
            return true;
        });
        return currentUnit;
    }
    /**
     * Converts value to milliseconds according to `baseUnit`.
     *
     * @param value     Source duration value
     * @param baseUnit  Base unit
     * @return Value in milliseconds
     */
    getMilliseconds(value, baseUnit) {
        // Get base unit
        if (!baseUnit) {
            baseUnit = this.get("baseUnit");
        }
        return value * this._getUnitValue(baseUnit);
    }
    _getUnitValue(timeUnit) {
        return this._getUnitValues()[timeUnit];
    }
    _getUnitValues() {
        return {
            "millisecond": 1,
            "second": 1000,
            "minute": 60000,
            "hour": 3600000,
            "day": 86400000,
            "week": 604800000,
            "month": 2592000000,
            "year": 31536000000,
        };
    }
}

/**
 * amCharts 5 locale
 *
 * Locale: en
 * Language: International English
 * Author: Martynas Majeris
 *
 * Follow instructions in [on this page](https://www.amcharts.com/docs/v5/tutorials/creating-translations/) to make corrections or add new translations.
 *
 * ---
 * Edit but leave the header section above this line. You can remove any
 * subsequent comment sections.
 * ---
 *
 * Use this file as a template to create translations. Leave the key part in
 * English intact. Fill the value with a translation.
 *
 * Empty string means no translation, so default "International English"
 * will be used.
 *
 * If you need the translation to literally be an empty string, use `null`
 * instead.
 *
 * IMPORTANT:
 * When translating make good effort to keep the translation length
 * at least the same chartcount as the English, especially for short prompts.
 *
 * Having significantly longer prompts may distort the actual charts.
 *
 * NOTE:
 * Some prompts - like months or weekdays - come in two versions: full and
 * shortened.
 *
 * If there's no official shortened version of these in your language, and it
 * would not be possible to invent such short versions that don't seem weird
 * to native speakers of that language, fill those with the same as full
 * version.
 *
 * PLACEHOLDERS:
 * Some prompts have placeholders like "%1". Those will be replaced by actual
 * values during translation and should be retained in the translated prompts.
 *
 * Placeholder positions may be changed to better suit structure of the
 * sentence.
 *
 * For example "From %1 to %2", when actually used will replace "%1" with an
 * actual value representing range start, and "%2" will be replaced by end
 * value.
 *
 * E.g. in a Scrollbar for Value axis "From %1 to %2" will become
 * "From 100 to 200". You may translate "From" and "to", as well as re-arrange
 * the order of the prompt itself, but make sure the "%1" and "%2" remain, in
 * places where they will make sense.
 *
 * Save the file as language_LOCALE, i.e. `en_GB.ts`, `fr_FR.ts`, etc.
 */
var en = {
    "firstDayOfWeek": 1,
    // Number formatting options.
    // 
    // Please check with the local standards which separator is accepted to be
    // used for separating decimals, and which for thousands.
    "_decimalSeparator": ".",
    "_thousandSeparator": ",",
    // Position of the percent sign in numbers
    "_percentPrefix": null,
    "_percentSuffix": "%",
    // Suffixes for numbers
    // When formatting numbers, big or small numers might be reformatted to
    // shorter version, by applying a suffix.
    // 
    // For example, 1000000 might become "1m".
    // Or 1024 might become "1KB" if we're formatting byte numbers.
    // 
    // This section defines such suffixes for all such cases.
    "_big_number_suffix_3": "k",
    "_big_number_suffix_6": "M",
    "_big_number_suffix_9": "G",
    "_big_number_suffix_12": "T",
    "_big_number_suffix_15": "P",
    "_big_number_suffix_18": "E",
    "_big_number_suffix_21": "Z",
    "_big_number_suffix_24": "Y",
    "_small_number_suffix_3": "m",
    "_small_number_suffix_6": "μ",
    "_small_number_suffix_9": "n",
    "_small_number_suffix_12": "p",
    "_small_number_suffix_15": "f",
    "_small_number_suffix_18": "a",
    "_small_number_suffix_21": "z",
    "_small_number_suffix_24": "y",
    "_byte_suffix_B": "B",
    "_byte_suffix_KB": "KB",
    "_byte_suffix_MB": "MB",
    "_byte_suffix_GB": "GB",
    "_byte_suffix_TB": "TB",
    "_byte_suffix_PB": "PB",
    // Default date formats for various periods.
    // 
    // This should reflect official or de facto formatting universally accepted
    // in the country translation is being made for
    // Available format codes here:
    // https://www.amcharts.com/docs/v5/concepts/formatters/formatting-dates/#Format_codes
    // 
    // This will be used when formatting date/time for particular granularity,
    // e.g. "_date_hour" will be shown whenever we need to show time as hours.
    // 
    // "date" is used as in default date format when showing standalone dates.
    "_date": "yyyy-MM-dd",
    "_date_millisecond": "mm:ss SSS",
    "_date_millisecond_full": "HH:mm:ss SSS",
    "_date_second": "HH:mm:ss",
    "_date_second_full": "HH:mm:ss",
    "_date_minute": "HH:mm",
    "_date_minute_full": "HH:mm - MMM dd, yyyy",
    "_date_hour": "HH:mm",
    "_date_hour_short": "HH",
    "_date_hour_full": "HH:mm - MMM dd, yyyy",
    "_date_day": "MMM dd",
    "_date_day_full": "MMM dd, yyyy",
    "_date_week": "ww",
    "_date_week_full": "MMM dd, yyyy",
    "_date_month": "MMM",
    "_date_month_full": "MMM, yyyy",
    "_date_year": "yyyy",
    // Default duration formats for various base units.
    // 
    // This will be used by DurationFormatter to format numeric values into
    // duration.
    // 
    // Notice how each duration unit comes in several versions. This is to ensure
    // that each base unit is shown correctly.
    // 
    // For example, if we have baseUnit set to "second", meaning our duration is
    // in seconds.
    // 
    // If we pass in `50` to formatter, it will know that we have just 50 seconds
    // (less than a minute) so it will use format in `"_duration_second"` ("ss"),
    // and the formatted result will be in like `"50"`.
    // 
    // If we pass in `70`, which is more than a minute, the formatter will switch
    // to `"_duration_second_minute"` ("mm:ss"), resulting in "01:10" formatted
    // text.
    // 
    // Available codes here:
    // https://www.amcharts.com/docs/v4/concepts/formatters/formatting-duration/#Available_Codes
    "_duration_millisecond": "SSS",
    "_duration_millisecond_second": "ss.SSS",
    "_duration_millisecond_minute": "mm:ss SSS",
    "_duration_millisecond_hour": "hh:mm:ss SSS",
    "_duration_millisecond_day": "d'd' mm:ss SSS",
    "_duration_millisecond_week": "d'd' mm:ss SSS",
    "_duration_millisecond_month": "M'm' dd'd' mm:ss SSS",
    "_duration_millisecond_year": "y'y' MM'm' dd'd' mm:ss SSS",
    "_duration_second": "ss",
    "_duration_second_minute": "mm:ss",
    "_duration_second_hour": "hh:mm:ss",
    "_duration_second_day": "d'd' hh:mm:ss",
    "_duration_second_week": "d'd' hh:mm:ss",
    "_duration_second_month": "M'm' dd'd' hh:mm:ss",
    "_duration_second_year": "y'y' MM'm' dd'd' hh:mm:ss",
    "_duration_minute": "mm",
    "_duration_minute_hour": "hh:mm",
    "_duration_minute_day": "d'd' hh:mm",
    "_duration_minute_week": "d'd' hh:mm",
    "_duration_minute_month": "M'm' dd'd' hh:mm",
    "_duration_minute_year": "y'y' MM'm' dd'd' hh:mm",
    "_duration_hour": "hh'h'",
    "_duration_hour_day": "d'd' hh'h'",
    "_duration_hour_week": "d'd' hh'h'",
    "_duration_hour_month": "M'm' dd'd' hh'h'",
    "_duration_hour_year": "y'y' MM'm' dd'd' hh'h'",
    "_duration_day": "d'd'",
    "_duration_day_week": "d'd'",
    "_duration_day_month": "M'm' dd'd'",
    "_duration_day_year": "y'y' MM'm' dd'd'",
    "_duration_week": "w'w'",
    "_duration_week_month": "w'w'",
    "_duration_week_year": "w'w'",
    "_duration_month": "M'm'",
    "_duration_month_year": "y'y' MM'm'",
    "_duration_year": "y'y'",
    // Era translations
    "_era_ad": "AD",
    "_era_bc": "BC",
    // Day part, used in 12-hour formats, e.g. 5 P.M.
    // Please note that these come in 3 variants:
    // * one letter (e.g. "A")
    // * two letters (e.g. "AM")
    // * two letters with dots (e.g. "A.M.")
    // 
    // All three need to to be translated even if they are all the same. Some
    // users might use one, some the other.
    "A": "",
    "P": "",
    "AM": "",
    "PM": "",
    "A.M.": "",
    "P.M.": "",
    // Date-related stuff.
    // 
    // When translating months, if there's a difference, use the form which is
    // best for a full date, e.g. as you would use it in "2018 January 1".
    // 
    // Note that May is listed twice. This is because in English May is the same
    // in both long and short forms, while in other languages it may not be the
    // case. Translate "May" to full word, while "May(short)" to shortened
    // version.
    // 
    // Should month names and weekdays be capitalized or not?
    // 
    // Rule of thumb is this: if the names should always be capitalized,
    // regardless of name position within date ("January", "21st January 2018",
    // etc.) use capitalized names. Otherwise enter all lowercase.
    // 
    // The date formatter will automatically capitalize names if they are the
    // first (or only) word in resulting date.
    "January": "",
    "February": "",
    "March": "",
    "April": "",
    "May": "",
    "June": "",
    "July": "",
    "August": "",
    "September": "",
    "October": "",
    "November": "",
    "December": "",
    "Jan": "",
    "Feb": "",
    "Mar": "",
    "Apr": "",
    "May(short)": "May",
    "Jun": "",
    "Jul": "",
    "Aug": "",
    "Sep": "",
    "Oct": "",
    "Nov": "",
    "Dec": "",
    // Weekdays.
    "Sunday": "",
    "Monday": "",
    "Tuesday": "",
    "Wednesday": "",
    "Thursday": "",
    "Friday": "",
    "Saturday": "",
    "Sun": "",
    "Mon": "",
    "Tue": "",
    "Wed": "",
    "Thu": "",
    "Fri": "",
    "Sat": "",
    // Date ordinal function.
    // 
    // This is used when adding number ordinal when formatting days in dates.
    // 
    // E.g. "January 1st", "February 2nd".
    // 
    // The function accepts day number, and returns a string to be added to the
    // day, like in default English translation, if we pass in 2, we will receive
    // "nd" back.
    "_dateOrd": function (day) {
        let res = "th";
        if ((day < 11) || (day > 13)) {
            switch (day % 10) {
                case 1:
                    res = "st";
                    break;
                case 2:
                    res = "nd";
                    break;
                case 3:
                    res = "rd";
                    break;
            }
        }
        return res;
    },
    // Various chart controls.
    // Shown as a tooltip on zoom out button.
    "Zoom Out": "",
    // Timeline buttons
    "Play": "",
    "Stop": "",
    // Chart's Legend screen reader title.
    "Legend": "",
    // Legend's item screen reader indicator.
    "Press ENTER to toggle": "",
    // Shown when the chart is busy loading something.
    "Loading": "",
    // Shown as the first button in the breadcrumb navigation, e.g.:
    // Home > First level > ...
    "Home": "",
    // Chart types.
    // Those are used as default screen reader titles for the main chart element
    // unless developer has set some more descriptive title.
    "Chart": "",
    "Serial chart": "",
    "X/Y chart": "",
    "Pie chart": "",
    "Gauge chart": "",
    "Radar chart": "",
    "Sankey diagram": "",
    "Flow diagram": "",
    "Chord diagram": "",
    "TreeMap chart": "",
    "Force directed tree": "",
    "Sliced chart": "",
    // Series types.
    // Used to name series by type for screen readers if they do not have their
    // name set.
    "Series": "",
    "Candlestick Series": "",
    "OHLC Series": "",
    "Column Series": "",
    "Line Series": "",
    "Pie Slice Series": "",
    "Funnel Series": "",
    "Pyramid Series": "",
    "X/Y Series": "",
    // Map-related stuff.
    "Map": "",
    "Press ENTER to zoom in": "",
    "Press ENTER to zoom out": "",
    "Use arrow keys to zoom in and out": "",
    "Use plus and minus keys on your keyboard to zoom in and out": "",
    // Export-related stuff.
    // These prompts are used in Export menu labels.
    // 
    // "Export" is the top-level menu item.
    // 
    // "Image", "Data", "Print" as second-level indicating type of export
    // operation.
    // 
    // Leave actual format untranslated, unless you absolutely know that they
    // would convey more meaning in some other way.
    "Export": "",
    "Image": "",
    "Data": "",
    "Print": "",
    "Press ENTER or use arrow keys to navigate": "",
    "Press ENTER to open": "",
    "Press ENTER to print.": "",
    "Press ENTER to export as %1.": "",
    "(Press ESC to close this message)": "",
    "Image Export Complete": "",
    "Export operation took longer than expected. Something might have gone wrong.": "",
    "Saved from": "",
    "PNG": "",
    "JPG": "",
    "GIF": "",
    "SVG": "",
    "PDF": "",
    "JSON": "",
    "CSV": "",
    "XLSX": "",
    "HTML": "",
    // Scrollbar-related stuff.
    // 
    // Scrollbar is a control which can zoom and pan the axes on the chart.
    // 
    // Each scrollbar has two grips: left or right (for horizontal scrollbar) or
    // upper and lower (for vertical one).
    // 
    // Prompts change in relation to whether Scrollbar is vertical or horizontal.
    // 
    // The final section is used to indicate the current range of selection.
    "Use TAB to select grip buttons or left and right arrows to change selection": "",
    "Use left and right arrows to move selection": "",
    "Use left and right arrows to move left selection": "",
    "Use left and right arrows to move right selection": "",
    "Use TAB select grip buttons or up and down arrows to change selection": "",
    "Use up and down arrows to move selection": "",
    "Use up and down arrows to move lower selection": "",
    "Use up and down arrows to move upper selection": "",
    "From %1 to %2": "",
    "From %1": "",
    "To %1": "",
    // Data loader-related.
    "No parser available for file: %1": "",
    "Error parsing file: %1": "",
    "Unable to load file: %1": "",
    "Invalid date": "",
    // Common actions
    "Close": "",
    "Minimize": "",
    "Confirm": ""
};

/**
 * Add localization functionality.
 */
class Language extends Entity {
    _setDefaults() {
        this.setPrivate("defaultLocale", en);
        super._setDefaults();
    }
    /**
     * Returns a prompt translation.
     *
     * @param   prompt   Prompt to translate
     * @param   locale   Target locale
     * @param   ...rest  Parameters
     * @return           Translation
     */
    translate(prompt, locale, ...rest) {
        // Get langauge
        if (!locale) {
            locale = this._root.locale || this.getPrivate("defaultLocale");
        }
        // Init translation
        let translation = prompt;
        let value = locale[prompt];
        // Try to look for the translation
        if (value === null) {
            translation = "";
        }
        else if (value != null) {
            // It might be an empty string
            if (value) {
                translation = value;
            }
        }
        else if (locale !== this.getPrivate("defaultLocale")) {
            // Try to look in default language
            return this.translate(prompt, this.getPrivate("defaultLocale"), ...rest);
        }
        // Replace %1, %2, etc params
        if (rest.length) {
            for (let len = rest.length, i = 0; i < len; ++i) {
                translation = translation.split("%" + (i + 1)).join(rest[i]);
            }
        }
        // Return the translation
        return translation;
    }
    /**
     * Returns a prompt translation, including custom prompts.
     *
     * @param   prompt   Prompt to translate
     * @param   locale   Target locale
     * @param   ...rest  Parameters
     * @return           Translation
     */
    translateAny(prompt, locale, ...rest) {
        return this.translate(prompt, locale, ...rest);
    }
    /**
     * Add a custom prompt to locale.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/locales/creating-translations/#Extending_locale_with_custom_prompts}
     * @param  prompt       Source prompt
     * @param  translation  Tanslation
     * @param  locale       Target locale
     */
    setTranslationAny(prompt, translation, locale) {
        const localeTarget = locale || this._root.locale;
        localeTarget[prompt] = translation;
    }
    /**
     * Add a batch of custom prompts.
     *
     * @since 5.3.3
     * @see {@link https://www.amcharts.com/docs/v5/concepts/locales/creating-translations/#Extending_locale_with_custom_prompts}
     * @param  translations  Translations
     * @param  locale        Target locale
     */
    setTranslationsAny(translations, locale) {
        each(translations, (key, val) => {
            this.setTranslationAny(key, val, locale);
        });
    }
    translateEmpty(prompt, locale, ...rest) {
        let translation = this.translate(prompt, locale, ...rest);
        return translation == prompt ? "" : translation;
    }
    translateFunc(prompt, locale) {
        if (this._root.locale[prompt]) {
            return this._root.locale[prompt];
        }
        // Try to look in default language
        if (locale !== this.getPrivate("defaultLocale")) {
            return this.translateFunc(prompt, this.getPrivate("defaultLocale"));
        }
        // Fail - return empty function
        return () => {
            return "";
        };
    }
    /**
     * Translates a btach of prompts.
     *
     * @param  list    Array of prompts to translate
     * @param  locale  Target locale
     * @return         Array of translations
     */
    translateAll(list, locale) {
        // Translate all items in the list
        if (!this.isDefault()) {
            return map(list, (x) => this.translate(x, locale));
        }
        else {
            return list;
        }
    }
    /**
     * Returns `true` if the currently selected locale is a default locale.
     *
     * @return `true` if locale is default; `false` if it is not.
     */
    isDefault() {
        return this.getPrivate("defaultLocale") === this._root.locale;
    }
}

/**
 * A base class for an amCharts theme.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/themes/} for more info
 * @important
 */
class Theme {
    constructor(root, isReal) {
        Object.defineProperty(this, "_root", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this._root = root;
        if (!isReal) {
            throw new Error("You cannot use `new Class()`, instead use `Class.new()`");
        }
    }
    /**
     * Use this method to create an instance of this class.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/#New_element_syntax} for more info
     * @param   root      Root element
     * @param   settings  Settings
     * @param   template  Template
     * @return            Instantiated object
     */
    static new(root) {
        const x = (new this(root, true));
        x.setupDefaultRules();
        return x;
    }
    setupDefaultRules() { }
    /**
     * Looks up the rules for a specific theme class.
     *
     * @see {@link https://www.amcharts.com/docs/v5/themes/} for more info
     * @param   themeClass Theme class
     * @return             Array<IRule<A>>
     */
    _lookupRules(themeClass) {
        return this._rules[themeClass];
    }
    /**
     * Creates a [[Template]] for specific theme class and tags.
     *
     * NOTE: the difference from `rule()` is that `ruleRaw()` does not do any
     * type checks.
     *
     * @see {@link https://www.amcharts.com/docs/v5/themes/} for more info
     * @param   themeClass Theme class
     * @param   themeTags  Theme tags
     * @return             Template
     */
    ruleRaw(themeClass, themeTags = []) {
        let rules = this._rules[themeClass];
        if (!rules) {
            rules = this._rules[themeClass] = [];
        }
        themeTags.sort(compare);
        const { index, found } = getSortedIndex(rules, (x) => {
            const order = compare(x.tags.length, themeTags.length);
            if (order === 0) {
                return compareArray(x.tags, themeTags, compare);
            }
            else {
                return order;
            }
        });
        if (found) {
            return rules[index].template;
        }
        else {
            const template = Template.new({});
            rules.splice(index, 0, {
                tags: themeTags,
                template,
            });
            return template;
        }
    }
    /**
     * Creates a [[Template]] for specific theme class and tags.
     *
     * @see {@link https://www.amcharts.com/docs/v5/themes/} for more info
     * @param   themeClass Theme class
     * @param   themeTags  Theme tags
     * @return             Template
     */
    rule(themeClass, themeTags = []) {
        return this.ruleRaw(themeClass, themeTags);
    }
}

/**
 * @ignore
 */
function setColor(rule, key, ic, name) {
    // TODO this shouldn't use get, figure out a better way
    rule.set(key, ic.get(name));
    ic.on(name, (value) => {
        rule.set(key, value);
    });
}
/**
 * @ignore
 */
class DefaultTheme extends Theme {
    setupDefaultRules() {
        super.setupDefaultRules();
        const language = this._root.language;
        const ic = this._root.interfaceColors;
        const horizontalLayout = this._root.horizontalLayout;
        const verticalLayout = this._root.verticalLayout;
        const r = this.rule.bind(this);
        /**
         * ========================================================================
         * core
         * ========================================================================
         */
        r("InterfaceColors").setAll({
            stroke: Color.fromHex(0xe5e5e5),
            fill: Color.fromHex(0xf3f3f3),
            primaryButton: Color.fromHex(0x6794dc),
            primaryButtonHover: Color.fromHex(0x6771dc),
            primaryButtonDown: Color.fromHex(0x68dc76),
            primaryButtonActive: Color.fromHex(0x68dc76),
            primaryButtonDisabled: Color.fromHex(0xdadada),
            primaryButtonTextDisabled: Color.fromHex(0xffffff),
            primaryButtonText: Color.fromHex(0xffffff),
            primaryButtonStroke: Color.fromHex(0xffffff),
            secondaryButton: Color.fromHex(0xd9d9d9),
            secondaryButtonHover: Color.fromHex(0xa3a3a3),
            secondaryButtonDown: Color.fromHex(0x8d8d8d),
            secondaryButtonActive: Color.fromHex(0xe6e6e6),
            secondaryButtonText: Color.fromHex(0x000000),
            secondaryButtonStroke: Color.fromHex(0xffffff),
            grid: Color.fromHex(0x000000),
            background: Color.fromHex(0xffffff),
            alternativeBackground: Color.fromHex(0x000000),
            text: Color.fromHex(0x000000),
            alternativeText: Color.fromHex(0xffffff),
            disabled: Color.fromHex(0xadadad),
            positive: Color.fromHex(0x50b300),
            negative: Color.fromHex(0xb30000)
        });
        {
            const rule = r("ColorSet");
            rule.setAll({
                passOptions: {
                    hue: 0.05,
                    saturation: 0,
                    lightness: 0
                },
                colors: [
                    Color.fromHex(0x67b7dc)
                ],
                step: 1,
                //baseColor: Color.fromRGB(103, 183, 220),
                //count: 20,
                reuse: false,
                startIndex: 0
            });
            rule.setPrivate("currentStep", 0);
            rule.setPrivate("currentPass", 0);
        }
        r("Entity").setAll({
            stateAnimationDuration: 0,
            stateAnimationEasing: out(cubic)
        });
        r("Component").setAll({
            interpolationDuration: 0,
            interpolationEasing: out(cubic)
        });
        r("Sprite").setAll({
            visible: true,
            scale: 1,
            opacity: 1,
            rotation: 0,
            position: "relative",
            tooltipX: p50,
            tooltipY: p50,
            tooltipPosition: "fixed",
            isMeasured: true
        });
        r("Sprite").states.create("default", { "visible": true, opacity: 1 });
        r("Container").setAll({
            interactiveChildren: true,
            setStateOnChildren: false
        });
        r("Graphics").setAll({
            strokeWidth: 1
        });
        r("Chart").setAll({
            width: p100,
            height: p100,
            interactiveChildren: false
        });
        r("ZoomableContainer").setAll({
            width: p100,
            height: p100,
            wheelable: true,
            pinchZoom: true,
            maxZoomLevel: 32,
            minZoomLevel: 1,
            zoomStep: 2,
            animationEasing: out(cubic),
            animationDuration: 600,
            maxPanOut: 0.4
        });
        /**
         * ------------------------------------------------------------------------
         * core: alignment
         * ------------------------------------------------------------------------
         */
        r("Sprite", ["horizontal", "center"]).setAll({
            centerX: p50,
            x: p50
        });
        r("Sprite", ["vertical", "center"]).setAll({
            centerY: p50,
            y: p50
        });
        r("Container", ["horizontal", "layout"]).setAll({
            layout: horizontalLayout
        });
        r("Container", ["vertical", "layout"]).setAll({
            layout: verticalLayout
        });
        /**
         * ------------------------------------------------------------------------
         * core: patterns
         * ------------------------------------------------------------------------
         */
        r("Pattern").setAll({
            repetition: "repeat",
            width: 50,
            height: 50,
            rotation: 0,
            fillOpacity: 1
        });
        r("LinePattern").setAll({
            gap: 6,
            colorOpacity: 1,
            width: 49,
            height: 49
        });
        r("RectanglePattern").setAll({
            gap: 6,
            checkered: false,
            centered: true,
            maxWidth: 5,
            maxHeight: 5,
            width: 48,
            height: 48,
            strokeWidth: 0
        });
        r("CirclePattern").setAll({
            gap: 5,
            checkered: false,
            centered: false,
            radius: 3,
            strokeWidth: 0,
            width: 45,
            height: 45
        });
        r("GrainPattern").setAll({
            width: 200,
            height: 200,
            colors: [Color.fromHex(0x000000)],
            size: 1,
            horizontalGap: 0,
            verticalGap: 0,
            density: 1,
            minOpacity: 0,
            maxOpacity: 0.2
        });
        {
            const rule = r("PatternSet");
            rule.setAll({
                step: 1
            });
            setColor(rule, "color", ic, "stroke");
        }
        /**
         * ------------------------------------------------------------------------
         * core: gradients
         * ------------------------------------------------------------------------
         */
        r("LinearGradient").setAll({
            rotation: 90
        });
        /**
         * ------------------------------------------------------------------------
         * core: Legend
         * ------------------------------------------------------------------------
         */
        r("Legend").setAll({
            fillField: "fill",
            strokeField: "stroke",
            nameField: "name",
            layout: GridLayout.new(this._root, {}),
            layer: 30,
            clickTarget: "itemContainer"
        });
        // Class: Container
        r("Container", ["legend", "item", "itemcontainer"]).setAll({
            paddingLeft: 5,
            paddingRight: 5,
            paddingBottom: 5,
            paddingTop: 5,
            layout: horizontalLayout,
            setStateOnChildren: true,
            interactiveChildren: false,
            ariaChecked: true,
            focusable: true,
            ariaLabel: language.translate("Press ENTER to toggle"),
            role: "checkbox"
        });
        {
            const rule = r("Rectangle", ["legend", "item", "background"]);
            rule.setAll({
                fillOpacity: 0,
            });
            setColor(rule, "fill", ic, "background");
        }
        r("Container", ["legend", "marker"]).setAll({
            setStateOnChildren: true,
            centerY: p50,
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingTop: 0,
            width: 18,
            height: 18
        });
        r("RoundedRectangle", ["legend", "marker", "rectangle"]).setAll({
            width: p100,
            height: p100,
            cornerRadiusBL: 3,
            cornerRadiusTL: 3,
            cornerRadiusBR: 3,
            cornerRadiusTR: 3
        });
        {
            const rule = r("RoundedRectangle", ["legend", "marker", "rectangle"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "disabled");
            setColor(rule, "stroke", ic, "disabled");
        }
        r("Label", ["legend", "label"]).setAll({
            centerY: p50,
            marginLeft: 5,
            paddingRight: 0,
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 0,
            populateText: true
        });
        {
            const rule = r("Label", ["legend", "label"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "disabled");
        }
        r("Label", ["legend", "value", "label"]).setAll({
            centerY: p50,
            marginLeft: 5,
            paddingRight: 0,
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 0,
            width: 50,
            centerX: p100,
            populateText: true
        });
        {
            const rule = r("Label", ["legend", "value", "label"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "disabled");
        }
        /**
         * ------------------------------------------------------------------------
         * core: HeatLegend
         * ------------------------------------------------------------------------
         */
        r("HeatLegend").setAll({
            stepCount: 1
        });
        r("RoundedRectangle", ["heatlegend", "marker"]).setAll({
            cornerRadiusTR: 0,
            cornerRadiusBR: 0,
            cornerRadiusTL: 0,
            cornerRadiusBL: 0
        });
        r("RoundedRectangle", ["vertical", "heatlegend", "marker"]).setAll({
            height: p100,
            width: 15
        });
        r("RoundedRectangle", ["horizontal", "heatlegend", "marker"]).setAll({
            width: p100,
            height: 15
        });
        r("HeatLegend", ["vertical"]).setAll({
            height: p100
        });
        r("HeatLegend", ["horizontal"]).setAll({
            width: p100
        });
        r("Label", ["heatlegend", "start"]).setAll({
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            paddingBottom: 5
        });
        r("Label", ["heatlegend", "end"]).setAll({
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            paddingBottom: 5
        });
        /**
         * ------------------------------------------------------------------------
         * core: Labels
         * ------------------------------------------------------------------------
         */
        {
            const rule = r("Label");
            rule.setAll({
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 10,
                fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
                fontSize: "1em",
                populateText: false
            });
            setColor(rule, "fill", ic, "text");
        }
        r("RadialLabel").setAll({
            textType: "regular",
            centerY: p50,
            centerX: p50,
            inside: false,
            radius: 0,
            baseRadius: p100,
            orientation: "auto",
            textAlign: "center"
        });
        r("EditableLabel").setAll({
            editOn: "click",
            //setStateOnChildren: true,
            themeTags: ["editablelabel"],
            multiLine: true
        });
        r("RoundedRectangle", ["editablelabel", "background"]).setAll({
            fillOpacity: 0,
            fill: Color.fromHex(0x000000),
            cornerRadiusBL: 3,
            cornerRadiusBR: 3,
            cornerRadiusTL: 3,
            cornerRadiusTR: 3,
            strokeOpacity: 0,
            stroke: Color.fromHex(0x000000)
        });
        {
            r("RoundedRectangle", ["editablelabel", "background"]).states.create("active", {
                strokeOpacity: 0.2,
            });
        }
        /**
         * ------------------------------------------------------------------------
         * core: Elements and shapes
         * ------------------------------------------------------------------------
         */
        r("RoundedRectangle").setAll({
            cornerRadiusTL: 8,
            cornerRadiusBL: 8,
            cornerRadiusTR: 8,
            cornerRadiusBR: 8
        });
        r("PointedRectangle").setAll({
            pointerBaseWidth: 15,
            pointerLength: 10,
            cornerRadius: 8
        });
        r("Slice").setAll({
            shiftRadius: 0,
            dRadius: 0,
            dInnerRadius: 0
        });
        {
            const rule = r("Tick");
            rule.setAll({
                strokeOpacity: .15,
                isMeasured: false,
                length: 4.5,
                position: "absolute",
                crisp: true
            });
            setColor(rule, "stroke", ic, "grid");
        }
        r("Bullet").setAll({
            locationX: 0.5,
            locationY: 0.5
        });
        /**
         * ------------------------------------------------------------------------
         * core: Tooltip
         * ------------------------------------------------------------------------
         */
        r("Tooltip").setAll({
            position: "absolute",
            getFillFromSprite: true,
            getStrokeFromSprite: false,
            autoTextColor: true,
            paddingTop: 9,
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 10,
            marginBottom: 5,
            pointerOrientation: "vertical",
            centerX: p50,
            centerY: p50,
            animationEasing: out(cubic),
            exportable: false
            //layer: 100
        });
        // system tooltip
        r("Tooltip", ["system"]).setAll({
            pointerOrientation: "horizontal",
            paddingTop: 4,
            paddingRight: 7,
            paddingBottom: 4,
            paddingLeft: 7
        });
        {
            const rule = r("PointedRectangle", ["tooltip", "system", "background"]);
            rule.setAll({
                strokeOpacity: 0.3
            });
            setColor(rule, "fill", ic, "background");
            setColor(rule, "stroke", ic, "grid");
        }
        r("Label", ["tooltip", "system"]).setAll({
            fontSize: 12,
            fill: ic.get("background")
        });
        r("Polygon").setAll({
            animationEasing: out(cubic),
        });
        r("Link").setAll({
            cornerRadius: 8,
            setStateOnChildren: true
        });
        {
            const rule = r("OrthogonalLine", ["link", "line"]);
            rule.setAll({
                isMeasured: false,
                crisp: true
            });
            const stateActive = rule.states.create("active", {
                strokeWidth: 2
            });
            setColor(stateActive, "stroke", ic, "negative");
        }
        r("OrthogonalLine", ["link", "hit"]).setAll({
            strokeWidth: 10,
            opacity: 0,
            strokeOpacity: 0
        });
        {
            const rule = r("OrthogonalLine");
            rule.setAll({
                strokeWidth: 1,
                strokeOpacity: 1,
                cornerRadius: 10
            });
            setColor(rule, "stroke", ic, "grid");
        }
        {
            const rule = r("Triangle", ["link"]);
            rule.setAll({
                width: 14,
                height: 10,
                centerY: 0
            });
            setColor(rule, "fill", ic, "grid");
            setColor(rule, "stroke", ic, "grid");
            rule.states.create("default", {
                stateAnimationDuration: 0
            });
            const state = rule.states.create("active", {
                stateAnimationDuration: 0,
                stroke: color(0xffffff),
                strokeWidth: 2
            });
            // draw circle and x inside
            state.set("draw", (display) => {
                display.arc(0, 0, 11, 0, Math.PI * 2);
                display.moveTo(-4, -4);
                display.lineTo(4, 4);
                display.moveTo(4, -4);
                display.lineTo(-4, 4);
            });
            setColor(state, "fill", ic, "negative");
        }
        {
            const rule = r("PointedRectangle", ["tooltip", "background"]);
            rule.setAll({
                strokeOpacity: 0.9,
                cornerRadius: 4,
                pointerLength: 4,
                pointerBaseWidth: 8,
                fillOpacity: 0.9,
                stroke: Color.fromHex(0xffffff)
            });
        }
        {
            const rule = r("Label", ["tooltip"]);
            rule.setAll({
                role: "tooltip",
                populateText: true,
                paddingRight: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingBottom: 0
            });
            setColor(rule, "fill", ic, "alternativeText");
        }
        /**
         * ------------------------------------------------------------------------
         * core: Button
         * ------------------------------------------------------------------------
         */
        r("Button").setAll({
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 10,
            interactive: true,
            layout: horizontalLayout,
            interactiveChildren: false,
            setStateOnChildren: true,
            focusable: true
        });
        r("Button").states.create("hover", {});
        r("Button").states.create("down", { stateAnimationDuration: 0 });
        r("Button").states.create("active", {});
        r("Button").states.create("disabled", {
            forceInactive: true
        });
        {
            const rule = r("RoundedRectangle", ["button", "background"]);
            setColor(rule, "fill", ic, "primaryButton");
            setColor(rule, "stroke", ic, "primaryButtonStroke");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background"]).states.create("hover", {});
            setColor(rule, "fill", ic, "primaryButtonHover");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background"]).states.create("down", { stateAnimationDuration: 0 });
            setColor(rule, "fill", ic, "primaryButtonDown");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background"]).states.create("active", {});
            setColor(rule, "fill", ic, "primaryButtonActive");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "primaryButtonDisabled");
        }
        {
            const rule = r("Graphics", ["button", "icon"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "primaryButtonTextDisabled");
        }
        {
            const rule = r("Label", ["button"]).states.create("disabled", {});
            setColor(rule, "fill", ic, "primaryButtonTextDisabled");
        }
        {
            const rule = r("Graphics", ["button", "icon"]);
            rule.setAll({
                forceInactive: true
            });
            setColor(rule, "stroke", ic, "primaryButtonText");
        }
        {
            const rule = r("Label", ["button"]);
            setColor(rule, "fill", ic, "primaryButtonText");
        }
        /**
         * ------------------------------------------------------------------------
         * ConfirmButton
         * ------------------------------------------------------------------------
         */
        r("ConfirmButton").setAll({
            toggleKey: "active",
            setStateOnChildren: true,
            label: Label.new(this._root, {
                text: language.translate("Confirm"),
                forceHidden: true
            })
        });
        {
            const rule = r("RoundedRectangle", ["button", "background", "confirm"]).states.create("active", {});
            setColor(rule, "fill", ic, "negative");
        }
        r("Label", ["button", "confirm"]).setAll({
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 3,
            paddingLeft: 5
        });
        r("Label", ["button", "confirm"]).states.create("default", {
            stateAnimationDuration: 0
        });
        r("Label", ["button", "confirm"]).states.create("active", {
            forceHidden: false,
            stateAnimationDuration: 0
        });
        {
            const rule = r("Graphics", ["icon", "confirm", "button"]);
            rule.setAll({
                stateAnimationDuration: 0
            });
            rule.states.create("default", {
                stateAnimationDuration: 0
            });
            setColor(rule, "stroke", ic, "primaryButtonText");
        }
        {
            const rule = r("Graphics", ["icon", "confirm", "button"]).states.create("active", {
                svgPath: "M -5 1 L 0 6 L 8 -5",
                strokeWidth: 2
            });
            setColor(rule, "stroke", ic, "primaryButtonText");
        }
        {
            const rule = r("Graphics", ["icon", "confirm", "button", "secondary"]).states.create("active", {});
            setColor(rule, "stroke", ic, "primaryButtonText");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background", "confirm", "secondary"]).states.create("active", {
                fillOpacity: 1
            });
            setColor(rule, "fill", ic, "negative");
        }
        {
            const rule = r("RoundedRectangle", ["button", "background", "confirm", "secondary"]).states.create("hoverActive", {
                fillOpacity: 1
            });
            setColor(rule, "fill", ic, "negative");
        }
        // required
        r("Button", ["button", "confirm"]).states.create("hoverActive", {});
        /**
         * ------------------------------------------------------------------------
         * charts/xy: ZoomOutButton
         * ------------------------------------------------------------------------
         */
        r("Button", ["zoom"]).setAll({
            paddingTop: 18,
            paddingBottom: 18,
            paddingLeft: 12,
            paddingRight: 12,
            centerX: 46,
            centerY: -10,
            y: 0,
            x: p100,
            role: "button",
            ariaLabel: language.translate("Zoom Out"),
            layer: 30
        });
        {
            const rule = r("RoundedRectangle", ["background", "button", "zoom"]);
            rule.setAll({
                cornerRadiusBL: 40,
                cornerRadiusBR: 40,
                cornerRadiusTL: 40,
                cornerRadiusTR: 40
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        {
            const rule = r("RoundedRectangle", ["background", "button", "zoom"]).states.create("hover", {});
            setColor(rule, "fill", ic, "primaryButtonHover");
        }
        {
            const rule = r("RoundedRectangle", ["background", "button", "zoom"]).states.create("down", { stateAnimationDuration: 0 });
            setColor(rule, "fill", ic, "primaryButtonDown");
        }
        {
            const rule = r("Graphics", ["icon", "button", "zoom"]);
            rule.setAll({
                crisp: true,
                strokeOpacity: 0.7,
                draw: (display) => {
                    display.moveTo(0, 0);
                    display.lineTo(12, 0);
                }
            });
            setColor(rule, "stroke", ic, "primaryButtonText");
        }
        /**
         * ------------------------------------------------------------------------
         * core: ResizeButton
         * ------------------------------------------------------------------------
         */
        r("Button", ["resize"]).setAll({
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 13,
            paddingRight: 13,
            draggable: true,
            centerX: p50,
            centerY: p50,
            position: "absolute",
            role: "slider",
            ariaValueMin: "0",
            ariaValueMax: "100",
            ariaLabel: language.translate("Use up and down arrows to move selection")
        });
        {
            const rule = r("RoundedRectangle", ["background", "resize", "button"]);
            rule.setAll({
                cornerRadiusBL: 40,
                cornerRadiusBR: 40,
                cornerRadiusTL: 40,
                cornerRadiusTR: 40
            });
            setColor(rule, "fill", ic, "secondaryButton");
            setColor(rule, "stroke", ic, "secondaryButtonStroke");
        }
        {
            const rule = r("RoundedRectangle", ["background", "resize", "button"]).states.create("hover", {});
            setColor(rule, "fill", ic, "secondaryButtonHover");
        }
        {
            const rule = r("RoundedRectangle", ["background", "resize", "button"]).states.create("down", { stateAnimationDuration: 0 });
            setColor(rule, "fill", ic, "secondaryButtonDown");
        }
        {
            const rule = r("Graphics", ["resize", "button", "icon"]);
            rule.setAll({
                interactive: false,
                crisp: true,
                strokeOpacity: 0.5,
                draw: (display) => {
                    display.moveTo(0, 0.5);
                    display.lineTo(0, 12.5);
                    display.moveTo(4, 0.5);
                    display.lineTo(4, 12.5);
                }
            });
            setColor(rule, "stroke", ic, "secondaryButtonText");
        }
        r("Button", ["resize", "vertical"]).setAll({
            rotation: 90,
            cursorOverStyle: "ns-resize"
        });
        r("Button", ["resize", "horizontal"]).setAll({
            cursorOverStyle: "ew-resize"
        });
        /**
         * ------------------------------------------------------------------------
         * core: PlayButton
         * ------------------------------------------------------------------------
         */
        r("Button", ["play"]).setAll({
            paddingTop: 13,
            paddingBottom: 13,
            paddingLeft: 14,
            paddingRight: 14,
            ariaLabel: language.translate("Play"),
            toggleKey: "active"
        });
        {
            const rule = r("RoundedRectangle", ["play", "background"]);
            rule.setAll({
                strokeOpacity: 0.5,
                cornerRadiusBL: 100,
                cornerRadiusBR: 100,
                cornerRadiusTL: 100,
                cornerRadiusTR: 100
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        {
            const rule = r("Graphics", ["play", "icon"]);
            rule.setAll({
                stateAnimationDuration: 0,
                dx: 1,
                draw: (display) => {
                    display.moveTo(0, -5);
                    display.lineTo(8, 0);
                    display.lineTo(0, 5);
                    display.lineTo(0, -5);
                }
            });
            setColor(rule, "fill", ic, "primaryButtonText");
        }
        r("Graphics", ["play", "icon"]).states.create("default", {
            stateAnimationDuration: 0
        });
        r("Graphics", ["play", "icon"]).states.create("active", {
            stateAnimationDuration: 0,
            draw: (display) => {
                display.moveTo(-4, -5);
                display.lineTo(-1, -5);
                display.lineTo(-1, 5);
                display.lineTo(-4, 5);
                display.lineTo(-4, -5);
                display.moveTo(4, -5);
                display.lineTo(1, -5);
                display.lineTo(1, 5);
                display.lineTo(4, 5);
                display.lineTo(4, -5);
            }
        });
        /**
         * ------------------------------------------------------------------------
         * core: SwitchButton
         * ------------------------------------------------------------------------
         */
        r("Button", ["switch"]).setAll({
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 4,
            paddingRight: 4,
            ariaLabel: language.translate("Press ENTER to toggle"),
            toggleKey: "active",
            width: 40,
            height: 24,
            layout: null
        });
        {
            const rule = r("RoundedRectangle", ["switch", "background"]);
            rule.setAll({
                strokeOpacity: 0.5,
                cornerRadiusBL: 100,
                cornerRadiusBR: 100,
                cornerRadiusTL: 100,
                cornerRadiusTR: 100
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        {
            const rule = r("Circle", ["switch", "icon"]);
            rule.setAll({
                radius: 8,
                centerY: 0,
                centerX: 0,
                dx: 0
            });
            setColor(rule, "fill", ic, "primaryButtonText");
        }
        r("Graphics", ["switch", "icon"]).states.create("active", {
            dx: 16
        });
        /**
         * ------------------------------------------------------------------------
         * core: Scrollbar
         * ------------------------------------------------------------------------
         */
        r("Scrollbar").setAll({
            start: 0,
            end: 1,
            layer: 30,
            animationEasing: out(cubic)
        });
        r("Scrollbar", ["vertical"]).setAll({
            marginRight: 13,
            marginLeft: 13,
            minWidth: 12,
            height: p100
        });
        r("Scrollbar", ["horizontal"]).setAll({
            marginTop: 13,
            marginBottom: 13,
            minHeight: 12,
            width: p100
        });
        this.rule("Button", ["scrollbar"]).setAll({
            exportable: false
        });
        {
            const rule = r("RoundedRectangle", ["scrollbar", "main", "background"]);
            rule.setAll({
                cornerRadiusTL: 8,
                cornerRadiusBL: 8,
                cornerRadiusTR: 8,
                cornerRadiusBR: 8,
                fillOpacity: 0.8,
            });
            setColor(rule, "fill", ic, "fill");
        }
        {
            const rule = r("RoundedRectangle", ["scrollbar", "thumb"]);
            rule.setAll({
                role: "slider",
                ariaLive: "polite",
                position: "absolute",
                draggable: true
            });
            setColor(rule, "fill", ic, "secondaryButton");
        }
        {
            const rule = r("RoundedRectangle", ["scrollbar", "thumb"]).states.create("hover", {});
            setColor(rule, "fill", ic, "secondaryButtonHover");
        }
        {
            const rule = r("RoundedRectangle", ["scrollbar", "thumb"]).states.create("down", { stateAnimationDuration: 0 });
            setColor(rule, "fill", ic, "secondaryButtonDown");
        }
        r("RoundedRectangle", ["scrollbar", "thumb", "vertical"]).setAll({
            x: p50,
            width: p100,
            centerX: p50,
            ariaLabel: language.translate("Use up and down arrows to move selection")
        });
        r("RoundedRectangle", ["scrollbar", "thumb", "horizontal"]).setAll({
            y: p50,
            centerY: p50,
            height: p100,
            ariaLabel: language.translate("Use left and right arrows to move selection")
        });
        // @todo: is this needed? used to be "ContentScrollbar"
        // r("Scrollbar", ["content?"]).setAll({
        // 	marginRight: 0,
        // 	marginLeft: 5,
        // 	layer: 5
        // });
        /**
         * ========================================================================
         * charts/xy
         * ========================================================================
         *
         * This needs to be in DefaultTheme because it's the only theme that is
         * automatically applied to Root, and tooltips different ancestors
         * than actual charts using them.
         */
        {
            const rule = r("PointedRectangle", ["axis", "tooltip", "background"]);
            rule.setAll({
                cornerRadius: 0
            });
            setColor(rule, "fill", ic, "alternativeBackground");
        }
        r("Label", ["axis", "tooltip"]).setAll({
            role: undefined
        });
        r("Label", ["axis", "tooltip", "y"]).setAll({
            textAlign: "right"
        });
        r("Label", ["axis", "tooltip", "y", "opposite"]).setAll({
            textAlign: "left"
        });
        r("Label", ["axis", "tooltip", "x"]).setAll({
            textAlign: "center"
        });
        r("Tooltip", ["categoryaxis"]).setAll({
            labelText: "{category}"
        });
        /**
         * ------------------------------------------------------------------------
         * Shapes
         * ------------------------------------------------------------------------
         */
        // Class: Graphics
        r("Star").setAll({
            spikes: 5,
            innerRadius: 5,
            radius: 10
        });
        // STOCK
        r("Tooltip", ["stock"]).setAll({
            paddingTop: 6,
            paddingBottom: 5,
            paddingLeft: 7,
            paddingRight: 7
        });
        r("Tooltip", ['indicator']).setAll({
            forceHidden: true
        });
        r("PointedRectangle", ["tooltip", "stock", "axis"]).setAll({
            pointerLength: 0,
            pointerBaseWidth: 0,
            cornerRadius: 3
        });
        r("Label", ["tooltip", "stock"]).setAll({
            fontSize: "0.8em"
        });
        // resizer
        r("SpriteResizer").setAll({
            rotationStep: 10,
            isMeasured: false
        });
        {
            const rule = r("Container", ["resizer", "grip"]);
            rule.states.create("hover", {});
        }
        {
            const rule = r("RoundedRectangle", ["resizer", "grip"]);
            rule.setAll({
                strokeOpacity: 0.7,
                strokeWidth: 1,
                fillOpacity: 1,
                width: 12,
                height: 12
            });
            setColor(rule, "fill", ic, "background");
            setColor(rule, "stroke", ic, "alternativeBackground");
        }
        {
            const rule = r("RoundedRectangle", ["resizer", "grip", "outline"]);
            rule.setAll({
                strokeOpacity: 0,
                fillOpacity: 0,
                width: 20,
                height: 20
            });
            rule.states.create("hover", {
                fillOpacity: 0.3
            });
            setColor(rule, "fill", ic, "alternativeBackground");
        }
        r("RoundedRectangle", ["resizer", "grip", "left"]).setAll({
            cornerRadiusBL: 0,
            cornerRadiusBR: 0,
            cornerRadiusTL: 0,
            cornerRadiusTR: 0
        });
        r("RoundedRectangle", ["resizer", "grip", "right"]).setAll({
            cornerRadiusBL: 0,
            cornerRadiusBR: 0,
            cornerRadiusTL: 0,
            cornerRadiusTR: 0
        });
        {
            const rule = r("Rectangle", ["resizer", "rectangle"]);
            rule.setAll({
                strokeDasharray: [2, 2],
                strokeOpacity: 0.5,
                strokeWidth: 1
            });
            setColor(rule, "stroke", ic, "alternativeBackground");
        }
        r("Graphics", ["button", "plus", "icon"]).setAll({
            x: p50,
            y: p50,
            draw: (display) => {
                display.moveTo(-4, 0);
                display.lineTo(4, 0);
                display.moveTo(0, -4);
                display.lineTo(0, 4);
            }
        });
        r("Graphics", ["button", "minus", "icon"]).setAll({
            x: p50,
            y: p50,
            draw: (display) => {
                display.moveTo(-4, 0);
                display.lineTo(4, 0);
            }
        });
        r("Graphics", ["button", "home", "icon"]).setAll({
            x: p50,
            y: p50,
            svgPath: "M 8 -1 L 6 -1 L 6 7 L 2 7 L 2 1 L -2 1 L -2 7 L -6 7 L -6 -1 L -8 -1 L 0 -9 L 8 -1 Z M 8 -1"
        });
        r("Button", ["zoomtools"]).setAll({
            marginTop: 1,
            marginBottom: 2
        });
        r("ZoomTools").setAll({
            x: p100,
            centerX: p100,
            y: p100,
            centerY: p100,
            paddingRight: 10,
            paddingBottom: 10
        });
        // Progress pie
        r("ProgressPie").setAll({
            radius: p100,
            width: 50,
            height: 50,
            centerX: percent(-50),
            centerY: percent(-50),
            innerRadius: percent(85),
            numberFormat: "#."
        });
        {
            const rule = r("Label", ["progresspie"]);
            rule.setAll({
                centerX: p50,
                centerY: p50,
                fontSize: "0.75em"
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        {
            const rule = r("Circle", ["progresspie"]);
            rule.setAll({
                fillOpacity: 0.5
            });
            setColor(rule, "fill", ic, "background");
        }
        {
            const rule = r("Slice", ["progresspie"]);
            rule.setAll({
                startAngle: -90
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        {
            const rule = r("Slice", ["progresspie", "background"]);
            rule.setAll({
                fillOpacity: 0.2,
                arc: 360
            });
            setColor(rule, "fill", ic, "primaryButton");
        }
        // Numeric stepper
        r("EditableLabel", ["numericstepper"]).setAll({
            y: p50,
            centerY: p50,
            multiLine: false,
            marginRight: 2
        });
        {
            const rule = r("Container", ["numericstepper", "buttons"]);
            rule.setAll({
                layout: this._root.verticalLayout,
                centerY: p50,
                y: p50,
                marginRight: 10,
                opacity: 0
            });
            rule.states.create("active", {
                opacity: 1
            });
            rule.states.create("default", {
                opacity: 0
            });
        }
        {
            const rule = r("Triangle", ["numericstepper"]);
            rule.setAll({
                width: 17,
                height: 11,
                marginTop: 3,
                marginBottom: 3,
                strokeWidth: 5,
                strokeOpacity: 0,
                cursorOverStyle: "pointer"
            });
            setColor(rule, "fill", ic, "secondaryButton");
        }
        {
            const rule = r("Triangle", ["downbutton"]);
            rule.setAll({
                rotation: 180
            });
        }
    }
}

/**
 * Modified from Pixi:
 *
 * The MIT License
 *
 * Copyright (c) 2013-2017 Mathew Groves, Chad Engler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * @ignore
 */
class Matrix {
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "c", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "d", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }
    /**
     * Sets the matrix based on all the available properties
     */
    setTransform(x, y, pivotX, pivotY, rotation, scale = 1) {
        this.a = Math.cos(rotation) * scale;
        this.b = Math.sin(rotation) * scale;
        this.c = -Math.sin(rotation) * scale;
        this.d = Math.cos(rotation) * scale;
        this.tx = x - ((pivotX * this.a) + (pivotY * this.c));
        this.ty = y - ((pivotX * this.b) + (pivotY * this.d));
    }
    /**
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     */
    apply(origin) {
        return {
            x: (this.a * origin.x) + (this.c * origin.y) + this.tx,
            y: (this.b * origin.x) + (this.d * origin.y) + this.ty
        };
    }
    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     */
    applyInverse(origin) {
        const id = 1 / ((this.a * this.d) + (this.c * -this.b));
        return {
            x: (this.d * id * origin.x) + (-this.c * id * origin.y) + (((this.ty * this.c) - (this.tx * this.d)) * id),
            y: (this.a * id * origin.y) + (-this.b * id * origin.x) + (((-this.ty * this.a) + (this.tx * this.b)) * id)
        };
    }
    /**
     * Appends the given Matrix to this Matrix.
     */
    append(matrix) {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;
        this.a = (matrix.a * a1) + (matrix.b * c1);
        this.b = (matrix.a * b1) + (matrix.b * d1);
        this.c = (matrix.c * a1) + (matrix.d * c1);
        this.d = (matrix.c * b1) + (matrix.d * d1);
        this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
        this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;
    }
    /**
     * Prepends the given Matrix to this Matrix.
     */
    prepend(matrix) {
        const tx1 = this.tx;
        if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
            const a1 = this.a;
            const c1 = this.c;
            this.a = (a1 * matrix.a) + (this.b * matrix.c);
            this.b = (a1 * matrix.b) + (this.b * matrix.d);
            this.c = (c1 * matrix.a) + (this.d * matrix.c);
            this.d = (c1 * matrix.b) + (this.d * matrix.d);
        }
        this.tx = (tx1 * matrix.a) + (this.ty * matrix.c) + matrix.tx;
        this.ty = (tx1 * matrix.b) + (this.ty * matrix.d) + matrix.ty;
    }
    /**
     * Copies the other matrix's properties into this matrix
     */
    copyFrom(matrix) {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;
    }
}

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var TAU = Math.PI * 2;

var mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
  var x = _ref.x,
      y = _ref.y;

  x *= rx;
  y *= ry;

  var xp = cosphi * x - sinphi * y;
  var yp = sinphi * x + cosphi * y;

  return {
    x: xp + centerx,
    y: yp + centery
  };
};

var approxUnitArc = function approxUnitArc(ang1, ang2) {
  // If 90 degree circular arc, use a constant
  // as derived from http://spencermortensen.com/articles/bezier-circle
  var a = ang2 === 1.5707963267948966 ? 0.551915024494 : ang2 === -1.5707963267948966 ? -0.551915024494 : 4 / 3 * Math.tan(ang2 / 4);

  var x1 = Math.cos(ang1);
  var y1 = Math.sin(ang1);
  var x2 = Math.cos(ang1 + ang2);
  var y2 = Math.sin(ang1 + ang2);

  return [{
    x: x1 - y1 * a,
    y: y1 + x1 * a
  }, {
    x: x2 + y2 * a,
    y: y2 - x2 * a
  }, {
    x: x2,
    y: y2
  }];
};

var vectorAngle = function vectorAngle(ux, uy, vx, vy) {
  var sign = ux * vy - uy * vx < 0 ? -1 : 1;

  var dot = ux * vx + uy * vy;

  if (dot > 1) {
    dot = 1;
  }

  if (dot < -1) {
    dot = -1;
  }

  return sign * Math.acos(dot);
};

var getArcCenter = function getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp) {
  var rxsq = Math.pow(rx, 2);
  var rysq = Math.pow(ry, 2);
  var pxpsq = Math.pow(pxp, 2);
  var pypsq = Math.pow(pyp, 2);

  var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;

  if (radicant < 0) {
    radicant = 0;
  }

  radicant /= rxsq * pypsq + rysq * pxpsq;
  radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);

  var centerxp = radicant * rx / ry * pyp;
  var centeryp = radicant * -ry / rx * pxp;

  var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
  var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;

  var vx1 = (pxp - centerxp) / rx;
  var vy1 = (pyp - centeryp) / ry;
  var vx2 = (-pxp - centerxp) / rx;
  var vy2 = (-pyp - centeryp) / ry;

  var ang1 = vectorAngle(1, 0, vx1, vy1);
  var ang2 = vectorAngle(vx1, vy1, vx2, vy2);

  if (sweepFlag === 0 && ang2 > 0) {
    ang2 -= TAU;
  }

  if (sweepFlag === 1 && ang2 < 0) {
    ang2 += TAU;
  }

  return [centerx, centery, ang1, ang2];
};

var arcToBezier = function arcToBezier(_ref2) {
  var px = _ref2.px,
      py = _ref2.py,
      cx = _ref2.cx,
      cy = _ref2.cy,
      rx = _ref2.rx,
      ry = _ref2.ry,
      _ref2$xAxisRotation = _ref2.xAxisRotation,
      xAxisRotation = _ref2$xAxisRotation === undefined ? 0 : _ref2$xAxisRotation,
      _ref2$largeArcFlag = _ref2.largeArcFlag,
      largeArcFlag = _ref2$largeArcFlag === undefined ? 0 : _ref2$largeArcFlag,
      _ref2$sweepFlag = _ref2.sweepFlag,
      sweepFlag = _ref2$sweepFlag === undefined ? 0 : _ref2$sweepFlag;

  var curves = [];

  if (rx === 0 || ry === 0) {
    return [];
  }

  var sinphi = Math.sin(xAxisRotation * TAU / 360);
  var cosphi = Math.cos(xAxisRotation * TAU / 360);

  var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
  var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;

  if (pxp === 0 && pyp === 0) {
    return [];
  }

  rx = Math.abs(rx);
  ry = Math.abs(ry);

  var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  var _getArcCenter = getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp),
      _getArcCenter2 = _slicedToArray(_getArcCenter, 4),
      centerx = _getArcCenter2[0],
      centery = _getArcCenter2[1],
      ang1 = _getArcCenter2[2],
      ang2 = _getArcCenter2[3];

  // If 'ang2' == 90.0000000001, then `ratio` will evaluate to
  // 1.0000000001. This causes `segments` to be greater than one, which is an
  // unecessary split, and adds extra points to the bezier curve. To alleviate
  // this issue, we round to 1.0 when the ratio is close to 1.0.


  var ratio = Math.abs(ang2) / (TAU / 4);
  if (Math.abs(1.0 - ratio) < 0.0000001) {
    ratio = 1.0;
  }

  var segments = Math.max(Math.ceil(ratio), 1);

  ang2 /= segments;

  for (var i = 0; i < segments; i++) {
    curves.push(approxUnitArc(ang1, ang2));
    ang1 += ang2;
  }

  return curves.map(function (curve) {
    var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery),
        x1 = _mapToEllipse.x,
        y1 = _mapToEllipse.y;

    var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery),
        x2 = _mapToEllipse2.x,
        y2 = _mapToEllipse2.y;

    var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery),
        x = _mapToEllipse3.x,
        y = _mapToEllipse3.y;

    return { x1: x1, y1: y1, x2: x2, y2: y2, x: x, y: y };
  });
};

/** @ignore */ /** */
/**
 * @ignore
 */
function checkArgs(name, actual, expected) {
    if (actual !== expected) {
        throw new Error("Required " + expected + " arguments for " + name + " but got " + actual);
    }
}
/**
 * @ignore
 */
function checkMinArgs(name, actual, expected) {
    if (actual < expected) {
        throw new Error("Required at least " + expected + " arguments for " + name + " but got " + actual);
    }
}
/**
 * @ignore
 */
function checkEvenArgs(name, actual, expected) {
    checkMinArgs(name, actual, expected);
    if ((actual % expected) !== 0) {
        throw new Error("Arguments for " + name + " must be in pairs of " + expected);
    }
}
/**
 * @ignore
 * This splits the flag so that way 0017 will be processed as 0 0 17
 *
 * This is important for weird paths like `M17 5A1 1 0 0017 30 1 1 0 0017 5`
 */
function splitArcFlags(args) {
    for (let i = 0; i < args.length; i += 7) {
        let index = i + 3;
        let flag = args[index];
        if (flag.length > 1) {
            const a = /^([01])([01])(.*)$/.exec(flag);
            if (a !== null) {
                args.splice(index, 0, a[1]);
                ++index;
                args.splice(index, 0, a[2]);
                ++index;
                if (a[3].length > 0) {
                    args[index] = a[3];
                }
                else {
                    args.splice(index, 1);
                }
            }
        }
        ++index;
        flag = args[index];
        if (flag.length > 1) {
            const a = /^([01])(.+)$/.exec(flag);
            if (a !== null) {
                args.splice(index, 0, a[1]);
                ++index;
                args[index] = a[2];
            }
        }
    }
}
/**
 * @ignore
 */
function assertBinary(value) {
    if (value === 0 || value === 1) {
        return value;
    }
    else {
        throw new Error("Flag must be 0 or 1");
    }
}
//  1 -> 0xffffff * (2 / 2)
//  2 -> 0xffffff * (1 / 2)
//
//  3 -> 0xffffff * (3 / 4)
//  4 -> 0xffffff * (1 / 4)
//
//  5 -> 0xffffff * (7 / 8)
//  6 -> 0xffffff * (5 / 8)
//  7 -> 0xffffff * (3 / 8)
//  8 -> 0xffffff * (1 / 8)
//
//  9 -> 0xffffff * (15 / 16)
// 10 -> 0xffffff * (13 / 16)
// 11 -> 0xffffff * (11 / 16)
// 12 -> 0xffffff *  (9 / 16)
// 13 -> 0xffffff *  (7 / 16)
// 14 -> 0xffffff *  (5 / 16)
// 15 -> 0xffffff *  (3 / 16)
// 16 -> 0xffffff *  (1 / 16)
// @todo remove this old color distribution algo if the new one pans out
/*function distributeId(id: number): number {
    if (id === 1) {
        return 0x000001;

    } else {
        // Finds the closest power of 2
        const base = Math.pow(2, Math.ceil(Math.log(id) / Math.log(2)));

        // Translates the id into an odd fraction index
        const index = ((base - id) * 2) + 1;

        // TODO is Math.round correct ?
        return Math.round(0xffffff * (index / base));
    }
}*/
/**
 * Function by smeans:
 * https://lowcode.life/generating-unique-contrasting-colors-in-javascript/
 * @ignore
 */
function distributeId(id) {
    const rgb = [0, 0, 0];
    for (let i = 0; i < 24; i++) {
        rgb[i % 3] <<= 1;
        rgb[i % 3] |= id & 0x01;
        id >>= 1;
    }
    return (rgb[0] | 0) + (rgb[1] << 8) + (rgb[2] << 16);
}
/**
 * @ignore
 */
function eachTargets(hitTarget, f) {
    for (;;) {
        if (hitTarget.interactive) {
            if (!f(hitTarget)) {
                break;
            }
        }
        if (hitTarget._parent) {
            hitTarget = hitTarget._parent;
        }
        else {
            break;
        }
    }
}
// TODO feature detection for mouse/touch/pointer
/**
 * @ignore
 */
function onPointerEvent(element, name, f) {
    return addEventListener(element, getRendererEvent(name), (event) => {
        const target = getEventTarget(event);
        let touches = event.touches;
        if (touches) {
            if (touches.length == 0) {
                touches = event.changedTouches;
            }
            f(copy$1(touches), target);
        }
        else {
            f([event], target);
        }
    });
}
/**
 * @ignore
 */
function isTainted(image) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, 1, 1);
    try {
        context.getImageData(0, 0, 1, 1);
        return false;
    }
    catch (err) {
        console.warn("Image \"" + image.src + "\" is loaded from different host and is not covered by CORS policy. For more information about the implications read here: https://www.amcharts.com/docs/v5/concepts/cors");
        return true;
    }
}
/**
 * This is needed to workaround a bug in iOS which causes it to not GC canvas elements.
 *
 * @ignore
 */
function clearCanvas(view) {
    view.width = 0;
    view.height = 0;
    view.style.width = "0px";
    view.style.height = "0px";
}
/**
 * Aligns the coordinate to the pixel, so it renders crisp
 *
 * @ignore
 */
function crisp(x) {
    return Math.floor(x) + .5;
}
/**
 * @ignore
 */
class CanvasPivot {
    constructor() {
        Object.defineProperty(this, "_x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    set x(value) {
        this._x = value;
    }
    set y(value) {
        this._y = value;
    }
}
/**
 * @ignore
 */
class CanvasDisplayObject extends DisposerClass {
    constructor(renderer) {
        super();
        Object.defineProperty(this, "_layer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "visible", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "exportable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "interactive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "inactive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "wheelable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "cancelTouch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isMeasured", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "buttonMode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "alpha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "compoundAlpha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "angle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "scale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "crisp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "pivot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new CanvasPivot()
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cursorOverStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_replacedCursorStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_localMatrix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Matrix()
        });
        Object.defineProperty(this, "_matrix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Matrix()
        });
        // TODO can this be replaced with _localMatrix ?
        Object.defineProperty(this, "_uMatrix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Matrix()
        });
        Object.defineProperty(this, "_renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_localBounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_bounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_colorId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._renderer = renderer;
    }
    subStatus(status) {
        return {
            inactive: (this.inactive == null ? status.inactive : this.inactive),
            layer: this._layer || status.layer,
        };
    }
    _dispose() {
        this._renderer._removeObject(this);
        this.getLayer().dirty = true;
    }
    getCanvas() {
        return this.getLayer().view;
    }
    getLayer() {
        let self = this;
        for (;;) {
            if (self._layer) {
                return self._layer;
            }
            else if (self._parent) {
                self = self._parent;
            }
            else {
                return this._renderer.defaultLayer;
            }
        }
    }
    setLayer(order, margin) {
        if (order == null) {
            this._layer = undefined;
        }
        else {
            const visible = true;
            this._layer = this._renderer.getLayer(order, visible);
            this._layer.visible = visible;
            this._layer.margin = margin;
            if (margin) {
                setInteractive(this._layer.view, false);
            }
            this._renderer._ghostLayer.setMargin(this._renderer.layers);
            if (this._parent) {
                this._parent.registerChildLayer(this._layer);
            }
            this._layer.dirty = true;
            this._renderer.resizeLayer(this._layer);
            this._renderer.resizeGhost();
        }
    }
    markDirtyLayer() {
        this.getLayer().dirty = true;
    }
    clear() {
        this.invalidateBounds();
    }
    invalidateBounds() {
        this._localBounds = undefined;
    }
    _addBounds(_bounds) { }
    _getColorId() {
        if (this._colorId === undefined) {
            this._colorId = this._renderer.paintId(this);
        }
        return this._colorId;
    }
    _isInteractive(status) {
        return !status.inactive && (this.interactive || this._renderer._forceInteractive > 0);
    }
    _isInteractiveMask(status) {
        return this._isInteractive(status);
    }
    contains(child) {
        for (;;) {
            if (child === this) {
                return true;
            }
            else if (child._parent) {
                child = child._parent;
            }
            else {
                return false;
            }
        }
    }
    toGlobal(point) {
        return this._matrix.apply(point);
    }
    toLocal(point) {
        return this._matrix.applyInverse(point);
    }
    getLocalMatrix() {
        this._uMatrix.setTransform(0, 0, this.pivot.x, this.pivot.y, this.angle * Math.PI / 180, this.scale);
        return this._uMatrix;
    }
    getLocalBounds() {
        if (!this._localBounds) {
            const bn = 10000000;
            this._localBounds = {
                left: bn,
                top: bn,
                right: -bn,
                bottom: -bn
            };
            this._addBounds(this._localBounds);
        }
        return this._localBounds;
    }
    getAdjustedBounds(bounds) {
        this._setMatrix();
        const matrix = this.getLocalMatrix();
        const p0 = matrix.apply({ x: bounds.left, y: bounds.top });
        const p1 = matrix.apply({ x: bounds.right, y: bounds.top });
        const p2 = matrix.apply({ x: bounds.right, y: bounds.bottom });
        const p3 = matrix.apply({ x: bounds.left, y: bounds.bottom });
        return {
            left: Math.min(p0.x, p1.x, p2.x, p3.x),
            top: Math.min(p0.y, p1.y, p2.y, p3.y),
            right: Math.max(p0.x, p1.x, p2.x, p3.x),
            bottom: Math.max(p0.y, p1.y, p2.y, p3.y)
        };
    }
    on(key, callback, context) {
        if (this.interactive) {
            return this._renderer._addEvent(this, key, callback, context);
        }
        else {
            return new Disposer(() => { });
        }
    }
    _setMatrix() {
        // TODO only calculate this if it has actually changed
        this._localMatrix.setTransform(this.x, this.y, this.pivot.x, this.pivot.y, 
        // Converts degrees to radians
        this.angle * Math.PI / 180, this.scale);
        this._matrix.copyFrom(this._localMatrix);
        if (this._parent) {
            // TODO only calculate this if it has actually changed
            this._matrix.prepend(this._parent._matrix);
        }
    }
    _transform(context, resolution) {
        const m = this._matrix;
        let tx = m.tx * resolution;
        let ty = m.ty * resolution;
        if (this.crisp) {
            tx = crisp(tx);
            ty = crisp(ty);
        }
        context.setTransform(m.a * resolution, m.b * resolution, m.c * resolution, m.d * resolution, tx, ty);
    }
    _transformMargin(context, resolution, margin) {
        const m = this._matrix;
        context.setTransform(m.a * resolution, m.b * resolution, m.c * resolution, m.d * resolution, (m.tx + margin.left) * resolution, (m.ty + margin.top) * resolution);
    }
    _transformLayer(context, resolution, layer) {
        if (layer.margin) {
            this._transformMargin(context, layer.scale || resolution, layer.margin);
        }
        else {
            this._transform(context, layer.scale || resolution);
        }
    }
    render(status, targetGhostLayer = 0) {
        if (this.visible && (this.exportable !== false || !this._renderer._omitTainted)) {
            this._setMatrix();
            const subStatus = this.subStatus(status);
            const resolution = this._renderer.resolution;
            const layers = this._renderer.layers;
            const ghostLayer = this._renderer._ghostLayer;
            const ghostContext = ghostLayer.context;
            const mask = this.mask;
            if (mask) {
                mask._setMatrix();
            }
            // TODO improve this
            each$1(layers, (layer) => {
                if (layer) {
                    const context = layer.context;
                    context.save();
                    // We must apply the mask before we transform the element
                    if (mask) {
                        mask._transformLayer(context, resolution, layer);
                        mask._runPath(context);
                        context.clip();
                    }
                    context.globalAlpha = this.compoundAlpha * this.alpha;
                    this._transformLayer(context, resolution, layer);
                    if (this.filter) {
                        context.filter = this.filter;
                    }
                }
            });
            ghostContext.save();
            // We must apply the mask before we transform the element
            if (mask && this._isInteractiveMask(subStatus)) {
                mask._transformMargin(ghostContext, resolution, ghostLayer.margin);
                mask._runPath(ghostContext);
                ghostContext.clip();
            }
            this._transformMargin(ghostContext, resolution, ghostLayer.margin);
            if ((subStatus.layer.order > 0) && !targetGhostLayer) {
                move(this._renderer._deferredGhostLayers, subStatus.layer.order);
            }
            this._render(subStatus, targetGhostLayer);
            ghostContext.restore();
            each$1(layers, (layer) => {
                if (layer) {
                    layer.context.restore();
                }
            });
        }
    }
    _render(status, _targetGhostLayer = 0) {
        if (this.exportable === false) {
            status.layer.tainted = true;
        }
    }
    _ghostOnly(targetGhostLayer = 0) {
        return targetGhostLayer > 0 ? true : false;
    }
    _drawGhost(status, targetGhostLayer = 0) {
        const interactive = this._isInteractive(status);
        const order = status.layer.order || 0;
        return interactive && ((order == 0 && !this._ghostOnly(targetGhostLayer)) || order == targetGhostLayer) ? true : false;
    }
    hovering() {
        return this._renderer._hovering.has(this);
    }
    dragging() {
        return this._renderer._dragging.some((x) => x.value === this);
    }
    shouldCancelTouch() {
        const renderer = this._renderer;
        if (renderer.tapToActivate && !renderer._touchActive) {
            return false;
        }
        if (this.cancelTouch) {
            return true;
        }
        else if (this._parent) {
            return this._parent.shouldCancelTouch();
        }
        return false;
    }
}
/**
 * @ignore
 */
class CanvasContainer extends CanvasDisplayObject {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "interactiveChildren", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_childLayers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    _isInteractiveMask(status) {
        return this.interactiveChildren || super._isInteractiveMask(status);
    }
    addChild(child) {
        child._parent = this;
        this._children.push(child);
        if (child._layer) {
            this.registerChildLayer(child._layer);
        }
    }
    addChildAt(child, index) {
        child._parent = this;
        this._children.splice(index, 0, child);
        if (child._layer) {
            this.registerChildLayer(child._layer);
        }
    }
    removeChild(child) {
        child._parent = undefined;
        removeFirst(this._children, child);
    }
    _render(status, targetGhostLayer) {
        super._render(status);
        const renderer = this._renderer;
        if (this.interactive && this.interactiveChildren) {
            ++renderer._forceInteractive;
        }
        each$1(this._children, (child) => {
            child.compoundAlpha = this.compoundAlpha * this.alpha;
            child.render(status, targetGhostLayer);
        });
        if (this.interactive && this.interactiveChildren) {
            --renderer._forceInteractive;
        }
    }
    registerChildLayer(layer) {
        if (!this._childLayers) {
            this._childLayers = [];
        }
        pushOne(this._childLayers, layer);
        if (this._parent) {
            this._parent.registerChildLayer(layer);
        }
    }
    markDirtyLayer(deep = false) {
        super.markDirtyLayer();
        if (deep && this._childLayers) {
            each$1(this._childLayers, (layer) => layer.dirty = true);
        }
    }
    _dispose() {
        super._dispose();
        if (this._childLayers) {
            each$1(this._childLayers, (layer) => {
                layer.dirty = true;
            });
        }
    }
}
/**
 * @ignore
 */
function setPoint(bounds, point) {
    bounds.left = Math.min(bounds.left, point.x);
    bounds.top = Math.min(bounds.top, point.y);
    bounds.right = Math.max(bounds.right, point.x);
    bounds.bottom = Math.max(bounds.bottom, point.y);
}
/**
 * @ignore
 */
class Op {
    colorize(_context, _forceColor) { }
    colorizeGhost(context, forceColor) {
        this.colorize(context, forceColor);
    }
    path(_context) { }
    pathGhost(context) {
        this.path(context);
    }
    addBounds(_bounds) { }
}
/**
 * @ignore
 */
class BeginPath extends Op {
    colorize(context, _forceColor) {
        context.beginPath();
    }
}
/**
 * @ignore
 */
class BeginFill extends Op {
    constructor(color) {
        super();
        Object.defineProperty(this, "color", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: color
        });
    }
    colorize(context, forceColor) {
        if (forceColor !== undefined) {
            context.fillStyle = forceColor;
        }
        else {
            context.fillStyle = this.color;
        }
    }
}
/**
 * @ignore
 */
class EndFill extends Op {
    constructor(clearShadow) {
        super();
        Object.defineProperty(this, "clearShadow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clearShadow
        });
    }
    colorize(context, _forceColor) {
        context.fill();
        if (this.clearShadow) {
            context.shadowColor = "";
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }
    }
}
/**
 * @ignore
 */
class EndStroke extends Op {
    colorize(context, _forceColor) {
        context.stroke();
    }
}
/**
 * @ignore
 */
class LineStyle extends Op {
    constructor(width, color, lineJoin, lineCap) {
        super();
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "color", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: color
        });
        Object.defineProperty(this, "lineJoin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lineJoin
        });
        Object.defineProperty(this, "lineCap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lineCap
        });
    }
    colorize(context, forceColor) {
        if (forceColor !== undefined) {
            context.strokeStyle = forceColor;
        }
        else {
            context.strokeStyle = this.color;
        }
        context.lineWidth = this.width;
        if (this.lineJoin) {
            context.lineJoin = this.lineJoin;
        }
        if (this.lineCap) {
            context.lineCap = this.lineCap;
        }
    }
}
/**
 * @ignore
 */
class LineDash extends Op {
    constructor(dash) {
        super();
        Object.defineProperty(this, "dash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dash
        });
    }
    colorize(context, _forceColor) {
        context.setLineDash(this.dash);
    }
}
/**
 * @ignore
 */
class LineDashOffset extends Op {
    constructor(dashOffset) {
        super();
        Object.defineProperty(this, "dashOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dashOffset
        });
    }
    colorize(context, _forceColor) {
        context.lineDashOffset = this.dashOffset;
    }
}
/**
 * @ignore
 */
class DrawRect extends Op {
    constructor(x, y, width, height) {
        super();
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
    }
    path(context) {
        context.rect(this.x, this.y, this.width, this.height);
    }
    addBounds(bounds) {
        const l = this.x;
        const t = this.y;
        const r = l + this.width;
        const b = t + this.height;
        setPoint(bounds, { x: l, y: t });
        setPoint(bounds, { x: r, y: t });
        setPoint(bounds, { x: l, y: b });
        setPoint(bounds, { x: r, y: b });
    }
}
/**
 * @ignore
 */
class DrawCircle extends Op {
    constructor(x, y, radius) {
        super();
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
    }
    path(context) {
        context.moveTo(this.x + this.radius, this.y);
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    }
    // TODO handle skewing and rotation
    addBounds(bounds) {
        setPoint(bounds, { x: this.x - this.radius, y: this.y - this.radius });
        setPoint(bounds, { x: this.x + this.radius, y: this.y + this.radius });
    }
}
/**
 * @ignore
 */
class DrawEllipse extends Op {
    constructor(x, y, radiusX, radiusY) {
        super();
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "radiusX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radiusX
        });
        Object.defineProperty(this, "radiusY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radiusY
        });
    }
    path(context) {
        context.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
    }
    // TODO handle skewing and rotation
    addBounds(bounds) {
        setPoint(bounds, { x: this.x - this.radiusX, y: this.y - this.radiusY });
        setPoint(bounds, { x: this.x + this.radiusX, y: this.y + this.radiusY });
    }
}
/**
 * @ignore
 */
class Arc extends Op {
    constructor(cx, cy, radius, startAngle, endAngle, anticlockwise) {
        super();
        Object.defineProperty(this, "cx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cx
        });
        Object.defineProperty(this, "cy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cy
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
        Object.defineProperty(this, "startAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: startAngle
        });
        Object.defineProperty(this, "endAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: endAngle
        });
        Object.defineProperty(this, "anticlockwise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: anticlockwise
        });
    }
    path(context) {
        if (this.radius > 0) {
            context.arc(this.cx, this.cy, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        }
    }
    addBounds(bounds) {
        let arcBounds = getArcBounds(this.cx, this.cy, this.startAngle * DEGREES, this.endAngle * DEGREES, this.radius);
        setPoint(bounds, { x: arcBounds.left, y: arcBounds.top });
        setPoint(bounds, { x: arcBounds.right, y: arcBounds.bottom });
    }
}
/**
 * @ignore
 */
class ArcTo extends Op {
    constructor(x1, y1, x2, y2, radius) {
        super();
        Object.defineProperty(this, "x1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x1
        });
        Object.defineProperty(this, "y1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y1
        });
        Object.defineProperty(this, "x2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x2
        });
        Object.defineProperty(this, "y2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y2
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
    }
    path(context) {
        if (this.radius > 0) {
            context.arcTo(this.x1, this.y1, this.x2, this.y2, this.radius);
        }
    }
    // TODO: add points
    addBounds(_bounds) {
        /*
        // not finished
        https://math.stackexchange.com/questions/1781438/finding-the-center-of-a-circle-given-two-points-and-a-radius-algebraically

        if (prevPoint) {
            let x1 = prevPoint.x;
            let y1 = prevPoint.y;
            let x2 = this.x2;
            let y2 = this.y2;
            let r = this.radius;

            let xa = (x2 - x1) / 2;
            let ya = (y2 - y1) / 2;

            let x0 = x1 + xa;
            let y0 = y1 + ya;

            let a = Math.hypot(xa, ya);
            let b = Math.sqrt(r * r - a * a);

            let cx = x0 + b * ya / a;
            let cy = y0 - b * xa / a;

            console.log(cx, cy);
        }*/
    }
}
/**
 * @ignore
 */
class LineTo extends Op {
    constructor(x, y) {
        super();
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
    }
    path(context) {
        context.lineTo(this.x, this.y);
    }
    addBounds(bounds) {
        setPoint(bounds, { x: this.x, y: this.y });
    }
}
/**
 * @ignore
 */
class MoveTo extends Op {
    constructor(x, y) {
        super();
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
    }
    path(context) {
        context.moveTo(this.x, this.y);
    }
    addBounds(bounds) {
        setPoint(bounds, { x: this.x, y: this.y });
    }
}
/**
 * @ignore
 */
class ClosePath extends Op {
    path(context) {
        context.closePath();
    }
}
/**
 * @ignore
 */
class BezierCurveTo extends Op {
    constructor(cpX, cpY, cpX2, cpY2, toX, toY) {
        super();
        Object.defineProperty(this, "cpX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpX
        });
        Object.defineProperty(this, "cpY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpY
        });
        Object.defineProperty(this, "cpX2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpX2
        });
        Object.defineProperty(this, "cpY2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpY2
        });
        Object.defineProperty(this, "toX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: toX
        });
        Object.defineProperty(this, "toY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: toY
        });
    }
    path(context) {
        context.bezierCurveTo(this.cpX, this.cpY, this.cpX2, this.cpY2, this.toX, this.toY);
    }
    // TODO: OK?
    addBounds(bounds) {
        setPoint(bounds, { x: this.cpX, y: this.cpY });
        setPoint(bounds, { x: this.cpX2, y: this.cpY2 });
        setPoint(bounds, { x: this.toX, y: this.toY });
    }
}
/**
 * @ignore
 */
class QuadraticCurveTo extends Op {
    constructor(cpX, cpY, toX, toY) {
        super();
        Object.defineProperty(this, "cpX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpX
        });
        Object.defineProperty(this, "cpY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cpY
        });
        Object.defineProperty(this, "toX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: toX
        });
        Object.defineProperty(this, "toY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: toY
        });
    }
    path(context) {
        context.quadraticCurveTo(this.cpX, this.cpY, this.toX, this.toY);
    }
    // TODO: OK?
    addBounds(bounds) {
        setPoint(bounds, { x: this.cpX, y: this.cpY });
        setPoint(bounds, { x: this.toX, y: this.toY });
    }
}
/**
 * @ignore
 */
class Shadow extends Op {
    constructor(color, blur, offsetX, offsetY, opacity) {
        super();
        Object.defineProperty(this, "color", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: color
        });
        Object.defineProperty(this, "blur", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: blur
        });
        Object.defineProperty(this, "offsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: offsetX
        });
        Object.defineProperty(this, "offsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: offsetY
        });
        Object.defineProperty(this, "opacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: opacity
        });
    }
    colorize(context, _forceColor) {
        if (this.opacity) {
            context.fillStyle = this.color;
        }
        context.shadowColor = this.color;
        context.shadowBlur = this.blur;
        context.shadowOffsetX = this.offsetX;
        context.shadowOffsetY = this.offsetY;
    }
    colorizeGhost(_context, _forceColor) { }
}
/**
 * @ignore
 */
class GraphicsImage extends Op {
    constructor(image, width, height, x, y) {
        super();
        Object.defineProperty(this, "image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: image
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
    }
    path(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    // TODO: OK?
    addBounds(bounds) {
        setPoint(bounds, { x: this.x, y: this.y });
        setPoint(bounds, { x: this.width, y: this.height });
    }
}
/**
 * @ignore
 */
class CanvasGraphics extends CanvasDisplayObject {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_operations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "blendMode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BlendMode.NORMAL
        });
        Object.defineProperty(this, "_hasShadows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_fillAlpha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_strokeAlpha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    clear() {
        super.clear();
        this._operations.length = 0;
    }
    _pushOp(op) {
        this._operations.push(op);
    }
    beginFill(color, alpha = 1) {
        this._fillAlpha = alpha;
        if (color) {
            if (color instanceof Color) {
                this._pushOp(new BeginFill(color.toCSS(alpha)));
            }
            else {
                this.isMeasured = true;
                this._pushOp(new BeginFill(color));
            }
        }
        else {
            this._pushOp(new BeginFill("rgba(0, 0, 0, " + alpha + ")"));
        }
    }
    endFill() {
        this._pushOp(new EndFill(this._hasShadows));
    }
    endStroke() {
        this._pushOp(new EndStroke());
    }
    beginPath() {
        this._pushOp(new BeginPath());
    }
    lineStyle(width = 0, color, alpha = 1, lineJoin, lineCap) {
        this._strokeAlpha = alpha;
        if (color) {
            if (color instanceof Color) {
                this._pushOp(new LineStyle(width, color.toCSS(alpha), lineJoin, lineCap));
            }
            else {
                this._pushOp(new LineStyle(width, color, lineJoin, lineCap));
            }
        }
        else {
            this._pushOp(new LineStyle(width, "rgba(0, 0, 0, " + alpha + ")", lineJoin, lineCap));
        }
    }
    setLineDash(dash) {
        this._pushOp(new LineDash(dash ? dash : []));
    }
    setLineDashOffset(dashOffset = 0) {
        this._pushOp(new LineDashOffset(dashOffset));
    }
    drawRect(x, y, width, height) {
        this._pushOp(new DrawRect(x, y, width, height));
    }
    drawCircle(x, y, radius) {
        this._pushOp(new DrawCircle(x, y, radius));
    }
    drawEllipse(x, y, radiusX, radiusY) {
        this._pushOp(new DrawEllipse(x, y, radiusX, radiusY));
    }
    arc(cx, cy, radius, startAngle, endAngle, anticlockwise = false) {
        this._pushOp(new Arc(cx, cy, radius, startAngle, endAngle, anticlockwise));
    }
    arcTo(x1, y1, x2, y2, radius) {
        this._pushOp(new ArcTo(x1, y1, x2, y2, radius));
    }
    lineTo(x, y) {
        this._pushOp(new LineTo(x, y));
    }
    moveTo(x, y) {
        this._pushOp(new MoveTo(x, y));
    }
    bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        this._pushOp(new BezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY));
    }
    quadraticCurveTo(cpX, cpY, toX, toY) {
        this._pushOp(new QuadraticCurveTo(cpX, cpY, toX, toY));
    }
    closePath() {
        this._pushOp(new ClosePath());
    }
    shadow(color, blur = 0, offsetX = 0, offsetY = 0, opacity) {
        this._hasShadows = true;
        this._pushOp(new Shadow(opacity ? color.toCSS(opacity) : color.toCSS(this._fillAlpha || this._strokeAlpha), blur, offsetX, offsetY));
    }
    image(image, width, height, x, y) {
        this._pushOp(new GraphicsImage(image, width, height, x, y));
    }
    // https://svgwg.org/svg2-draft/paths.html#DProperty
    // TODO better error checking
    svgPath(path) {
        let x = 0;
        let y = 0;
        let cpx = null;
        let cpy = null;
        let qcpx = null;
        let qcpy = null;
        const SEGMENTS_REGEXP = /([MmZzLlHhVvCcSsQqTtAa])([^MmZzLlHhVvCcSsQqTtAa]*)/g;
        const ARGS_REGEXP = /[\u0009\u0020\u000A\u000C\u000D]*([\+\-]?[0-9]*\.?[0-9]+(?:[eE][\+\-]?[0-9]+)?)[\u0009\u0020\u000A\u000C\u000D]*,?/g;
        let match;
        while ((match = SEGMENTS_REGEXP.exec(path)) !== null) {
            const name = match[1];
            const rest = match[2];
            const args = [];
            while ((match = ARGS_REGEXP.exec(rest)) !== null) {
                args.push(match[1]);
            }
            // Reset control point
            if (name !== "S" && name !== "s" && name !== "C" && name !== "c") {
                cpx = null;
                cpy = null;
            }
            // Reset control point
            if (name !== "Q" && name !== "q" && name !== "T" && name !== "t") {
                qcpx = null;
                qcpy = null;
            }
            switch (name) {
                case "M":
                    checkEvenArgs(name, args.length, 2);
                    x = +args[0];
                    y = +args[1];
                    this.moveTo(x, y);
                    for (let i = 2; i < args.length; i += 2) {
                        x = +args[i];
                        y = +args[i + 1];
                        this.lineTo(x, y);
                    }
                    break;
                case "m":
                    checkEvenArgs(name, args.length, 2);
                    x += +args[0];
                    y += +args[1];
                    this.moveTo(x, y);
                    for (let i = 2; i < args.length; i += 2) {
                        x += +args[i];
                        y += +args[i + 1];
                        this.lineTo(x, y);
                    }
                    break;
                case "L":
                    checkEvenArgs(name, args.length, 2);
                    for (let i = 0; i < args.length; i += 2) {
                        x = +args[i];
                        y = +args[i + 1];
                        this.lineTo(x, y);
                    }
                    break;
                case "l":
                    checkEvenArgs(name, args.length, 2);
                    for (let i = 0; i < args.length; i += 2) {
                        x += +args[i];
                        y += +args[i + 1];
                        this.lineTo(x, y);
                    }
                    break;
                case "H":
                    checkMinArgs(name, args.length, 1);
                    for (let i = 0; i < args.length; ++i) {
                        x = +args[i];
                        this.lineTo(x, y);
                    }
                    break;
                case "h":
                    checkMinArgs(name, args.length, 1);
                    for (let i = 0; i < args.length; ++i) {
                        x += +args[i];
                        this.lineTo(x, y);
                    }
                    break;
                case "V":
                    checkMinArgs(name, args.length, 1);
                    for (let i = 0; i < args.length; ++i) {
                        y = +args[i];
                        this.lineTo(x, y);
                    }
                    break;
                case "v":
                    checkMinArgs(name, args.length, 1);
                    for (let i = 0; i < args.length; ++i) {
                        y += +args[i];
                        this.lineTo(x, y);
                    }
                    break;
                case "C":
                    checkEvenArgs(name, args.length, 6);
                    for (let i = 0; i < args.length; i += 6) {
                        const x1 = +args[i];
                        const y1 = +args[i + 1];
                        cpx = +args[i + 2];
                        cpy = +args[i + 3];
                        x = +args[i + 4];
                        y = +args[i + 5];
                        this.bezierCurveTo(x1, y1, cpx, cpy, x, y);
                    }
                    break;
                case "c":
                    checkEvenArgs(name, args.length, 6);
                    for (let i = 0; i < args.length; i += 6) {
                        const x1 = +args[i] + x;
                        const y1 = +args[i + 1] + y;
                        cpx = +args[i + 2] + x;
                        cpy = +args[i + 3] + y;
                        x += +args[i + 4];
                        y += +args[i + 5];
                        this.bezierCurveTo(x1, y1, cpx, cpy, x, y);
                    }
                    break;
                case "S":
                    checkEvenArgs(name, args.length, 4);
                    if (cpx === null || cpy === null) {
                        cpx = x;
                        cpy = y;
                    }
                    for (let i = 0; i < args.length; i += 4) {
                        const x1 = 2 * x - cpx;
                        const y1 = 2 * y - cpy;
                        cpx = +args[i];
                        cpy = +args[i + 1];
                        x = +args[i + 2];
                        y = +args[i + 3];
                        this.bezierCurveTo(x1, y1, cpx, cpy, x, y);
                    }
                    break;
                case "s":
                    checkEvenArgs(name, args.length, 4);
                    if (cpx === null || cpy === null) {
                        cpx = x;
                        cpy = y;
                    }
                    for (let i = 0; i < args.length; i += 4) {
                        const x1 = 2 * x - cpx;
                        const y1 = 2 * y - cpy;
                        cpx = +args[i] + x;
                        cpy = +args[i + 1] + y;
                        x += +args[i + 2];
                        y += +args[i + 3];
                        this.bezierCurveTo(x1, y1, cpx, cpy, x, y);
                    }
                    break;
                case "Q":
                    checkEvenArgs(name, args.length, 4);
                    for (let i = 0; i < args.length; i += 4) {
                        qcpx = +args[i];
                        qcpy = +args[i + 1];
                        x = +args[i + 2];
                        y = +args[i + 3];
                        this.quadraticCurveTo(qcpx, qcpy, x, y);
                    }
                    break;
                case "q":
                    checkEvenArgs(name, args.length, 4);
                    for (let i = 0; i < args.length; i += 4) {
                        qcpx = +args[i] + x;
                        qcpy = +args[i + 1] + y;
                        x += +args[i + 2];
                        y += +args[i + 3];
                        this.quadraticCurveTo(qcpx, qcpy, x, y);
                    }
                    break;
                case "T":
                    checkEvenArgs(name, args.length, 2);
                    if (qcpx === null || qcpy === null) {
                        qcpx = x;
                        qcpy = y;
                    }
                    for (let i = 0; i < args.length; i += 2) {
                        qcpx = 2 * x - qcpx;
                        qcpy = 2 * y - qcpy;
                        x = +args[i];
                        y = +args[i + 1];
                        this.quadraticCurveTo(qcpx, qcpy, x, y);
                    }
                    break;
                case "t":
                    checkEvenArgs(name, args.length, 2);
                    if (qcpx === null || qcpy === null) {
                        qcpx = x;
                        qcpy = y;
                    }
                    for (let i = 0; i < args.length; i += 2) {
                        qcpx = 2 * x - qcpx;
                        qcpy = 2 * y - qcpy;
                        x += +args[i];
                        y += +args[i + 1];
                        this.quadraticCurveTo(qcpx, qcpy, x, y);
                    }
                    break;
                case "A":
                case "a":
                    const relative = (name === "a");
                    splitArcFlags(args);
                    checkEvenArgs(name, args.length, 7);
                    for (let i = 0; i < args.length; i += 7) {
                        let cx = +args[i + 5];
                        let cy = +args[i + 6];
                        if (relative) {
                            cx += x;
                            cy += y;
                        }
                        const bs = arcToBezier({
                            px: x,
                            py: y,
                            rx: +args[i],
                            ry: +args[i + 1],
                            xAxisRotation: +args[i + 2],
                            largeArcFlag: assertBinary(+args[i + 3]),
                            sweepFlag: assertBinary(+args[i + 4]),
                            cx,
                            cy,
                        });
                        each$1(bs, (b) => {
                            this.bezierCurveTo(b.x1, b.y1, b.x2, b.y2, b.x, b.y);
                            x = b.x;
                            y = b.y;
                        });
                    }
                    break;
                case "Z":
                case "z":
                    checkArgs(name, args.length, 0);
                    this.closePath();
                    break;
            }
        }
    }
    _runPath(context) {
        context.beginPath();
        each$1(this._operations, (op) => {
            op.path(context);
        });
    }
    _render(status, targetGhostLayer = 0) {
        super._render(status);
        const layerDirty = status.layer.dirty;
        const interactive = this._isInteractive(status);
        const ghostOnly = this._ghostOnly(targetGhostLayer);
        const drawGhost = this._drawGhost(status, targetGhostLayer);
        if (layerDirty || interactive || ghostOnly) {
            const context = status.layer.context;
            const ghostContext = this._renderer._ghostLayer.context;
            if (layerDirty && !ghostOnly) {
                context.globalCompositeOperation = this.blendMode;
                context.beginPath();
            }
            let color;
            if (drawGhost) {
                ghostContext.beginPath();
                color = this._getColorId();
            }
            each$1(this._operations, (op) => {
                if (layerDirty && !ghostOnly) {
                    op.path(context);
                    op.colorize(context, undefined);
                }
                if (drawGhost) {
                    op.pathGhost(ghostContext);
                    op.colorizeGhost(ghostContext, color);
                }
            });
        }
    }
    renderDetached(context) {
        if (this.visible) {
            this._setMatrix();
            context.save();
            // We must apply the mask before we transform the element
            const mask = this.mask;
            if (mask) {
                mask._setMatrix();
                mask._transform(context, 1);
                mask._runPath(context);
                context.clip();
            }
            // TODO handle compoundAlpha somehow ?
            context.globalAlpha = this.compoundAlpha * this.alpha;
            this._transform(context, 1);
            if (this.filter) {
                context.filter = this.filter;
            }
            context.globalCompositeOperation = this.blendMode;
            context.beginPath();
            each$1(this._operations, (op) => {
                op.path(context);
                op.colorize(context, undefined);
            });
            context.restore();
        }
    }
    _addBounds(bounds) {
        if (this.visible && this.isMeasured) {
            each$1(this._operations, (op) => {
                op.addBounds(bounds);
            });
        }
    }
}
/**
 * @ignore
 */
class CanvasText extends CanvasDisplayObject {
    constructor(renderer, text, style) {
        super(renderer);
        Object.defineProperty(this, "text", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resolution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "textVisible", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "truncated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_textInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_originalScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        this.text = text;
        this.style = style;
    }
    invalidateBounds() {
        super.invalidateBounds();
        this._textInfo = undefined;
    }
    invalidateVisibility() {
        this.textVisible = true;
        this.scale = this._originalScale || 1;
    }
    _shared(context) {
        if (this.style.textAlign) {
            context.textAlign = this.style.textAlign;
        }
        if (this.style.direction) {
            context.direction = this.style.direction;
        }
        if (this.style.textBaseline) {
            context.textBaseline = this.style.textBaseline;
        }
    }
    _prerender(status, ignoreGhost = false, ignoreFontWeight = false) {
        super._render(status);
        const context = status.layer.context;
        const ghostContext = this._renderer._ghostLayer.context;
        // Font style
        const style = this.style;
        let fontStyle = this._getFontStyle(undefined, ignoreFontWeight);
        context.font = fontStyle;
        if (this._isInteractive(status) && !ignoreGhost) {
            ghostContext.font = fontStyle;
        }
        // Other parameters
        if (style.fill) {
            if (style.fill instanceof Color) {
                context.fillStyle = style.fill.toCSS(style.fillOpacity != undefined ? style.fillOpacity : 1);
            }
            else {
                context.fillStyle = style.fill;
            }
        }
        if (style.shadowColor) {
            status.layer.context.shadowColor = style.shadowColor.toCSS(style.shadowOpacity || 1);
        }
        if (style.shadowBlur) {
            status.layer.context.shadowBlur = style.shadowBlur;
        }
        if (style.shadowOffsetX) {
            status.layer.context.shadowOffsetX = style.shadowOffsetX;
        }
        if (style.shadowOffsetY) {
            status.layer.context.shadowOffsetY = style.shadowOffsetY;
        }
        this._shared(context);
        if (this._isInteractive(status) && !ignoreGhost) {
            ghostContext.fillStyle = this._getColorId();
            this._shared(ghostContext);
        }
    }
    _getFontStyle(style2, ignoreFontWeight = false) {
        // Process defaults
        const style = this.style;
        let fontStyle = [];
        if (style2 && style2.fontVariant) {
            fontStyle.push(style2.fontVariant);
        }
        else if (style.fontVariant) {
            fontStyle.push(style.fontVariant);
        }
        if (!ignoreFontWeight) {
            if (style2 && style2.fontWeight) {
                fontStyle.push(style2.fontWeight);
            }
            else if (style.fontWeight) {
                fontStyle.push(style.fontWeight);
            }
        }
        if (style2 && style2.fontStyle) {
            fontStyle.push(style2.fontStyle);
        }
        else if (style.fontStyle) {
            fontStyle.push(style.fontStyle);
        }
        if (style2 && style2.fontSize) {
            if (isNumber(style2.fontSize)) {
                style2.fontSize = style2.fontSize + "px";
            }
            fontStyle.push(style2.fontSize);
        }
        else if (style.fontSize) {
            if (isNumber(style.fontSize)) {
                style.fontSize = style.fontSize + "px";
            }
            fontStyle.push(style.fontSize);
        }
        if (style2 && style2.fontFamily) {
            fontStyle.push(style2.fontFamily);
        }
        else if (style.fontFamily) {
            fontStyle.push(style.fontFamily);
        }
        else if (fontStyle.length) {
            fontStyle.push("Arial");
        }
        return fontStyle.join(" ");
    }
    _render(status, targetGhostLayer = 0) {
        // We need measurements in order to properly position text for alignment
        if (!this._textInfo) {
            this._measure(status);
        }
        if (this.textVisible) {
            const interactive = this._isInteractive(status);
            const context = status.layer.context;
            const layerDirty = status.layer.dirty;
            const ghostContext = this._renderer._ghostLayer.context;
            const ghostOnly = this._ghostOnly(targetGhostLayer);
            const drawGhost = this._drawGhost(status, targetGhostLayer);
            context.save();
            ghostContext.save();
            this._prerender(status);
            // const lines = this.text.toString().replace(/\r/g, "").split(/\n/);
            // const x = this._localBounds && (this._localBounds.left < 0) ? Math.abs(this._localBounds.left) : 0;
            // Process text info produced by _measure()
            each$1(this._textInfo, (line, _index) => {
                each$1(line.textChunks, (chunk, _index) => {
                    // Set style
                    if (chunk.style) {
                        context.save();
                        ghostContext.save();
                        if (!ghostOnly) {
                            context.font = chunk.style;
                        }
                        if (this._isInteractive(status)) {
                            ghostContext.font = chunk.style;
                        }
                    }
                    if (chunk.fill) {
                        context.save();
                        if (!ghostOnly) {
                            context.fillStyle = chunk.fill.toCSS();
                        }
                        // Color does not affect ghostContext so we not set it
                    }
                    // Draw text
                    if (layerDirty && !ghostOnly) {
                        context.fillText(chunk.text, chunk.offsetX, line.offsetY + chunk.offsetY);
                    }
                    // Draw underline
                    if (chunk.textDecoration == "underline" || chunk.textDecoration == "line-through") {
                        let thickness = 1;
                        let offset = 1;
                        let fontSize = chunk.height;
                        const oversizedBehavior = this.style.oversizedBehavior || "";
                        if (["truncate", "wrap", "wrap-no-break"].indexOf(oversizedBehavior) > -1) {
                            // Measure actual width of the text so the line fits
                            const metrics = this._measureText(chunk.text, context);
                            chunk.width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
                        }
                        let offsetX = chunk.offsetX;
                        switch (this.style.textAlign) {
                            case "right":
                            case "end":
                                offsetX -= chunk.width;
                                break;
                            case "center":
                                offsetX -= chunk.width / 2;
                                break;
                        }
                        if (chunk.style) {
                            const format = TextFormatter.getTextStyle(chunk.style);
                            switch (format.fontWeight) {
                                case "bolder":
                                case "bold":
                                case "700":
                                case "800":
                                case "900":
                                    thickness = 2;
                                    break;
                            }
                        }
                        if (fontSize) {
                            offset = fontSize / 20;
                        }
                        let y;
                        if (chunk.textDecoration == "line-through") {
                            y = thickness + line.offsetY + chunk.offsetY - chunk.height / 2;
                        }
                        else {
                            y = thickness + offset * 1.5 + line.offsetY + chunk.offsetY;
                        }
                        if (!ghostOnly) {
                            context.save();
                            context.beginPath();
                            if (chunk.fill) {
                                context.strokeStyle = chunk.fill.toCSS();
                            }
                            else if (this.style.fill && this.style.fill instanceof Color) {
                                context.strokeStyle = this.style.fill.toCSS();
                            }
                            context.lineWidth = thickness * offset;
                            context.moveTo(offsetX, y);
                            context.lineTo(offsetX + chunk.width, y);
                            context.stroke();
                            context.restore();
                        }
                    }
                    if (interactive && this.interactive && drawGhost) {
                        // Draw text in ghost canvas ONLY if it is set as interactive
                        // explicitly. This way we avoid hit test anomalies caused by anti
                        // aliasing of text.
                        ghostContext.fillText(chunk.text, chunk.offsetX, line.offsetY + chunk.offsetY);
                    }
                    if (chunk.fill) {
                        context.restore();
                        // Color does not affect ghostContext so we not set it
                    }
                    // Reset style
                    if (chunk.style) {
                        context.restore();
                        ghostContext.restore();
                    }
                });
            });
            context.restore();
            ghostContext.restore();
        }
    }
    _addBounds(bounds) {
        if (this.visible && this.isMeasured) {
            //if (this._textVisible) {
            const x = this._measure({
                inactive: this.inactive,
                layer: this.getLayer(),
            });
            setPoint(bounds, { x: x.left, y: x.top });
            setPoint(bounds, { x: x.right, y: x.bottom });
            //}
        }
    }
    _ignoreFontWeight() {
        return /apple/i.test(navigator.vendor);
    }
    _measure(status) {
        const context = status.layer.context;
        const ghostContext = this._renderer._ghostLayer.context;
        const rtl = this.style.direction == "rtl";
        // Reset text info
        this._textInfo = [];
        // Init
        const oversizedBehavior = this.style.oversizedBehavior;
        const maxWidth = this.style.maxWidth;
        const truncate = isNumber(maxWidth) && oversizedBehavior == "truncate";
        const wrap = isNumber(maxWidth) && (oversizedBehavior == "wrap" || oversizedBehavior == "wrap-no-break");
        // Pre-render
        context.save();
        ghostContext.save();
        this._prerender(status, true, this._ignoreFontWeight());
        // Get default font metrix
        const refText = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
        // Split up text into lines
        const lines = this.text.toString().replace(/\r/g, "").split(/\n/);
        let styleRestored = true;
        let minX = 0;
        let maxX = 0;
        // Iterate through the lines
        let offsetY = 0;
        let currentStyle;
        each$1(lines, (line, _index) => {
            // Split up line into format/value chunks
            let chunks;
            if (line == "") {
                chunks = [{
                        type: "value",
                        text: ""
                    }];
            }
            else {
                chunks = TextFormatter.chunk(line, false, this.style.ignoreFormatting);
            }
            while (chunks.length > 0) {
                // Init line object
                let lineInfo = {
                    offsetY: offsetY,
                    ascent: 0,
                    width: 0,
                    height: 0,
                    left: 0,
                    right: 0,
                    textChunks: []
                };
                // Measure reference text
                const metrics = this._measureText(refText, context);
                const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                lineInfo.height = height;
                lineInfo.ascent = metrics.actualBoundingBoxAscent;
                let currentFormat;
                let currentDecoration = this.style.textDecoration;
                let currentFill;
                let currentChunkWidth;
                let skipFurtherText = false;
                let firstTextChunk = true;
                let leftoverChunks = [];
                let currentVerticalAlign;
                //let offsetX = 0;
                //let chunk;
                //while(chunk = chunks.shift()) {
                eachContinue$1(chunks, (chunk, index) => {
                    // Format chunk
                    if (chunk.type == "format") {
                        if (chunk.text == "[/]") {
                            if (!styleRestored) {
                                context.restore();
                                ghostContext.restore();
                                styleRestored = true;
                            }
                            currentFill = undefined;
                            currentStyle = undefined;
                            currentChunkWidth = undefined;
                            currentDecoration = this.style.textDecoration;
                            currentVerticalAlign = undefined;
                            currentFormat = chunk.text;
                        }
                        else {
                            if (!styleRestored) {
                                context.restore();
                                ghostContext.restore();
                            }
                            let format = TextFormatter.getTextStyle(chunk.text);
                            const fontStyle = this._getFontStyle(format);
                            context.save();
                            ghostContext.save();
                            context.font = fontStyle;
                            currentStyle = fontStyle;
                            currentFormat = chunk.text;
                            if (format.textDecoration) {
                                currentDecoration = format.textDecoration;
                            }
                            if (format.fill) {
                                currentFill = format.fill;
                            }
                            if (format.width) {
                                currentChunkWidth = toNumber(format.width);
                            }
                            if (format.verticalAlign) {
                                currentVerticalAlign = format.verticalAlign;
                            }
                            styleRestored = false;
                            // Measure reference text after change of format
                            const metrics = this._measureText(refText, context);
                            const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                            if (height > lineInfo.height) {
                                lineInfo.height = height;
                            }
                            if (metrics.actualBoundingBoxAscent > lineInfo.ascent) {
                                lineInfo.ascent = metrics.actualBoundingBoxAscent;
                            }
                        }
                    }
                    // Text chunk
                    else if (chunk.type == "value" && !skipFurtherText) {
                        // Measure
                        const metrics = this._measureText(chunk.text, context);
                        let chunkWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
                        // Check for fit
                        if (truncate) {
                            this.truncated = undefined;
                            // Break words?
                            let breakWords = firstTextChunk || this.style.breakWords || false;
                            // Measure ellipsis and check if it fits
                            const ellipsis = this.style.ellipsis || "";
                            const ellipsisMetrics = this._measureText(ellipsis, context);
                            const ellipsisWidth = ellipsisMetrics.actualBoundingBoxLeft + ellipsisMetrics.actualBoundingBoxRight;
                            // Check fit
                            if ((lineInfo.width + chunkWidth) > maxWidth) {
                                const excessWidth = maxWidth - lineInfo.width - ellipsisWidth;
                                chunk.text = this._truncateText(context, chunk.text, excessWidth, breakWords);
                                chunk.text += ellipsis;
                                skipFurtherText = true;
                                this.truncated = true;
                            }
                        }
                        else if (wrap) {
                            // Check fit
                            if ((lineInfo.width + chunkWidth) > maxWidth) {
                                const excessWidth = maxWidth - lineInfo.width;
                                const tmpText = this._truncateText(context, chunk.text, excessWidth, false, (firstTextChunk && this.style.oversizedBehavior != "wrap-no-break"));
                                if (tmpText == "") {
                                    // Unable to fit a single letter - hide the whole label
                                    this.textVisible = true;
                                    return false;
                                }
                                //skipFurtherText = true;
                                //Add remaining chunks for the next line
                                leftoverChunks = chunks.slice(index + 1);
                                //Add remaining text of current chunk if it was forced-cut
                                if (trim(tmpText) != trim(chunk.text)) {
                                    leftoverChunks.unshift({
                                        type: "value",
                                        text: chunk.text.substr(tmpText.length)
                                    });
                                    if (currentFormat) {
                                        leftoverChunks.unshift({
                                            type: "format",
                                            text: currentFormat
                                        });
                                    }
                                }
                                // Set current chunk (truncated)
                                chunk.text = trim(tmpText);
                                chunks = [];
                                skipFurtherText = true;
                            }
                        }
                        // Chunk width?
                        let leftBoundMod = 1;
                        let rightBoundMod = 1;
                        if (currentStyle && currentChunkWidth && (currentChunkWidth > chunkWidth)) {
                            // increase horizontal bounding boxes accordingly
                            const boundsMod = chunkWidth / currentChunkWidth;
                            switch (this.style.textAlign) {
                                case "right":
                                case "end":
                                    leftBoundMod = boundsMod;
                                    break;
                                case "center":
                                    leftBoundMod = boundsMod;
                                    rightBoundMod = boundsMod;
                                    break;
                                default:
                                    rightBoundMod = boundsMod;
                            }
                            chunkWidth = currentChunkWidth;
                        }
                        const chunkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                        if (chunkHeight > lineInfo.height) {
                            lineInfo.height = chunkHeight;
                        }
                        if (metrics.actualBoundingBoxAscent > lineInfo.ascent) {
                            lineInfo.ascent = metrics.actualBoundingBoxAscent;
                        }
                        lineInfo.width += chunkWidth;
                        lineInfo.left += metrics.actualBoundingBoxLeft / leftBoundMod;
                        lineInfo.right += metrics.actualBoundingBoxRight / rightBoundMod;
                        lineInfo.textChunks.push({
                            style: currentStyle,
                            fill: currentFill,
                            text: chunk.text,
                            width: chunkWidth,
                            height: chunkHeight,
                            left: metrics.actualBoundingBoxLeft,
                            right: metrics.actualBoundingBoxRight,
                            ascent: metrics.actualBoundingBoxAscent,
                            offsetX: 0,
                            offsetY: 0,
                            textDecoration: currentDecoration,
                            verticalAlign: currentVerticalAlign
                        });
                        //offsetX += chunkWidth;
                        firstTextChunk = false;
                    }
                    return true;
                    //}
                });
                if (this.style.lineHeight instanceof Percent) {
                    lineInfo.height *= this.style.lineHeight.value;
                    lineInfo.ascent *= this.style.lineHeight.value;
                }
                else {
                    lineInfo.height *= this.style.lineHeight || 1.2;
                    lineInfo.ascent *= this.style.lineHeight || 1.2;
                }
                if (minX < lineInfo.left) {
                    minX = lineInfo.left;
                }
                if (maxX < lineInfo.right) {
                    maxX = lineInfo.right;
                }
                this._textInfo.push(lineInfo);
                //lineInfo.offsetY += lineInfo.ascent;
                offsetY += lineInfo.height;
                // Reset chunks so that it can proceed to the next line
                chunks = leftoverChunks || [];
            }
        });
        if (!styleRestored) {
            context.restore();
            ghostContext.restore();
        }
        // Adjust chunk internal offsets
        each$1(this._textInfo, (lineInfo, _index) => {
            let currentChunkOffset = 0;
            each$1(lineInfo.textChunks, (chunk) => {
                chunk.offsetX = currentChunkOffset + chunk.left - lineInfo.left;
                chunk.offsetY += lineInfo.height - lineInfo.height * (this.style.baselineRatio || 0.19);
                currentChunkOffset += chunk.width * (rtl ? -1 : 1);
                if (chunk.verticalAlign) {
                    switch (chunk.verticalAlign) {
                        case "super":
                            chunk.offsetY -= lineInfo.height / 2 - chunk.height / 2;
                            break;
                        case "sub":
                            chunk.offsetY += chunk.height / 2;
                            break;
                    }
                }
            });
        });
        const bounds = {
            left: rtl ? -maxX : -minX,
            top: 0,
            right: rtl ? minX : maxX,
            bottom: offsetY,
        };
        // We need to fit?
        if (oversizedBehavior !== "none") {
            const ratio = this._fitRatio(bounds);
            if (ratio < 1) {
                if (oversizedBehavior == "fit") {
                    if (isNumber(this.style.minScale) && (ratio < this.style.minScale)) {
                        this.textVisible = false;
                        bounds.left = 0;
                        bounds.top = 0;
                        bounds.right = 0;
                        bounds.bottom = 0;
                    }
                    else {
                        if (!this._originalScale) {
                            this._originalScale = this.scale;
                        }
                        this.scale = ratio;
                        this.textVisible = true;
                    }
                }
                else if (oversizedBehavior == "hide") {
                    this.textVisible = false;
                    bounds.left = 0;
                    bounds.top = 0;
                    bounds.right = 0;
                    bounds.bottom = 0;
                }
                else {
                    switch (this.style.textAlign) {
                        case "right":
                        case "end":
                            bounds.left = rtl ? maxWidth : -maxWidth;
                            bounds.right = 0;
                            break;
                        case "center":
                            bounds.left = -maxWidth / 2;
                            bounds.right = maxWidth / 2;
                            break;
                        default:
                            bounds.left = 0;
                            bounds.right = rtl ? -maxWidth : maxWidth;
                    }
                    this.scale = this._originalScale || 1;
                    this._originalScale = undefined;
                    this.textVisible = true;
                }
            }
            else {
                this.scale = this._originalScale || 1;
                this._originalScale = undefined;
                this.textVisible = true;
            }
        }
        context.restore();
        ghostContext.restore();
        return bounds;
    }
    _fitRatio(bounds) {
        const maxW = this.style.maxWidth;
        const maxH = this.style.maxHeight;
        if (!isNumber(maxW) && !isNumber(maxH)) {
            return 1;
        }
        const w = bounds.right - bounds.left;
        const h = bounds.bottom - bounds.top;
        return Math.min(maxW / w || 1, maxH / h || 1);
    }
    _truncateText(context, text, maxWidth, breakWords = false, fallbackBreakWords = true) {
        let width;
        do {
            if (breakWords) {
                text = text.slice(0, -1);
            }
            else {
                let tmp = text.replace(/[^,;:!?\\\/\s​]+[,;:!?\\\/\s​]*$/g, "");
                if ((tmp == "" || tmp === text) && fallbackBreakWords) {
                    breakWords = true;
                }
                else if (tmp == "") {
                    return text;
                }
                else {
                    text = tmp;
                }
            }
            const metrics = this._measureText(text, context);
            width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        } while ((width > maxWidth) && text != "");
        return text;
    }
    _measureText(text, context) {
        let metrics = context.measureText(text);
        let fakeMetrics = {};
        if (metrics.actualBoundingBoxAscent == null) {
            const div = document.createElement("div");
            div.innerText = text;
            div.style.visibility = "hidden";
            div.style.position = "absolute";
            div.style.top = "-1000000px;";
            div.style.fontFamily = this.style.fontFamily || "";
            div.style.fontSize = this.style.fontSize + "";
            document.body.appendChild(div);
            const bbox = div.getBoundingClientRect();
            document.body.removeChild(div);
            const h = bbox.height;
            const w = metrics.width;
            let left = 0;
            let right = w;
            fakeMetrics = {
                actualBoundingBoxAscent: h,
                actualBoundingBoxDescent: 0,
                actualBoundingBoxLeft: left,
                actualBoundingBoxRight: right,
                fontBoundingBoxAscent: h,
                fontBoundingBoxDescent: 0,
                width: w
            };
            //return fake;
        }
        else {
            fakeMetrics = {
                actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
                actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
                actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
                actualBoundingBoxRight: metrics.actualBoundingBoxRight,
                fontBoundingBoxAscent: metrics.actualBoundingBoxAscent,
                fontBoundingBoxDescent: metrics.actualBoundingBoxDescent,
                width: metrics.width
            };
        }
        const w = metrics.width;
        switch (this.style.textAlign) {
            case "right":
            case "end":
                fakeMetrics.actualBoundingBoxLeft = w;
                fakeMetrics.actualBoundingBoxRight = 0;
                break;
            case "center":
                fakeMetrics.actualBoundingBoxLeft = w / 2;
                fakeMetrics.actualBoundingBoxRight = w / 2;
                break;
            default:
                fakeMetrics.actualBoundingBoxLeft = 0;
                fakeMetrics.actualBoundingBoxRight = w;
        }
        return fakeMetrics;
    }
}
/**
 * @ignore
 */
class CanvasTextStyle {
    constructor() {
        //public wordWrapWidth: number = 100;
        Object.defineProperty(this, "fill", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fillOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textAlign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontFamily", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontWeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontVariant", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textDecoration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowBlur", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOffsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOffsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // leading?: number;
        // letterSpacing?: number;
        Object.defineProperty(this, "lineHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: percent(120)
        });
        Object.defineProperty(this, "baselineRatio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.19
        });
        // padding?: number;
        // stroke?: number;
        // strokeThickness?: number;
        // trim?: number;
        // wordWrap?: boolean;
        Object.defineProperty(this, "direction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textBaseline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "oversizedBehavior", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "none"
        });
        Object.defineProperty(this, "breakWords", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "ellipsis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "…"
        });
        Object.defineProperty(this, "maxWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "minScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ignoreFormatting", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
}
/**
 * @ignore
 */
class CanvasRadialText extends CanvasText {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "textType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "circular"
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inside", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "orientation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "auto"
        });
        Object.defineProperty(this, "kerning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_textReversed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _render(status, targetGhostLayer = 0) {
        switch (this.textType) {
            case "circular":
                this._renderCircular(status, targetGhostLayer);
                break;
            default:
                super._render(status, targetGhostLayer);
                break;
        }
    }
    _renderCircular(status, targetGhostLayer = 0) {
        if (this.textVisible) {
            this._prerender(status);
            const interactive = this._isInteractive(status);
            const context = status.layer.context;
            const layerDirty = status.layer.dirty;
            const ghostContext = this._renderer._ghostLayer.context;
            // Savepoint
            context.save();
            if (interactive) {
                ghostContext.save();
            }
            // We need measurements in order to properly position text for alignment
            if (!this._textInfo) {
                this._measure(status);
            }
            // Init
            let radius = (this.radius || 0);
            let startAngle = (this.startAngle || 0);
            let deltaAngle = 0;
            let orientation = this.orientation;
            let inward = orientation == "auto" ? "auto" : orientation == "inward";
            const inside = this.inside;
            const align = this.style.textAlign || "left";
            const kerning = this.kerning || 0;
            let clockwise = align == "left" ? 1 : -1;
            const shouldReverse = !this._textReversed;
            const ghostOnly = this._ghostOnly(targetGhostLayer);
            const drawGhost = this._drawGhost(status, targetGhostLayer);
            // Check if we need to invert the whole stuff
            if (inward == "auto") {
                // Calc max angle so we know whether we need to flip it
                let maxAngle = 0;
                let midAngle = 0;
                each$1(this._textInfo, (line, _index) => {
                    const deltaAngle = startAngle + (line.width / (radius - line.height)) / 2 * -clockwise;
                    if (deltaAngle > maxAngle) {
                        maxAngle = deltaAngle;
                    }
                });
                if (align == "left") {
                    midAngle = (maxAngle + deltaAngle / 2) * DEGREES;
                }
                else if (align == "right") {
                    midAngle = (maxAngle - deltaAngle / 2) * DEGREES;
                }
                else {
                    midAngle = startAngle * DEGREES;
                }
                midAngle = normalizeAngle(midAngle);
                inward = (midAngle >= 270) || (midAngle <= 90);
            }
            if (inward == true && shouldReverse) {
                this._textInfo.reverse();
                this._textReversed = true;
            }
            // if ((inward == false && align == "left") || (inward == true && align == "right")) {
            // 	clockwise *= -1;
            // }
            // Process text info produced by _measure()
            each$1(this._textInfo, (line, _index) => {
                const textHeight = line.height;
                // Adjust radius (for `inside = false`)
                // Radius adjustment for `inside = false` is below the line calculation
                if (!inside) {
                    radius += textHeight;
                }
                // Reverse letters if we're painting them counter-clockwise
                if (((clockwise == -1 && inward) || (clockwise == 1 && !inward)) && shouldReverse) {
                    line.textChunks.reverse();
                }
                // Init angles
                let lineStartAngle = startAngle;
                deltaAngle = 0;
                // Adjust for center-align
                if (align == "center") {
                    lineStartAngle += (line.width / (radius - textHeight)) / 2 * -clockwise;
                    deltaAngle = lineStartAngle - startAngle;
                }
                // if (inward == "auto") {
                // 	let midAngle;
                // 	if (align == "left") {
                // 		midAngle = (lineStartAngle + deltaAngle / 2) * $math.DEGREES;
                // 	}
                // 	else if () {
                // 		midAngle = (lineStartAngle - deltaAngle / 2) * $math.DEGREES;
                // 	}
                // 	inward = (midAngle >= 270) || (midAngle <= 90);
                // }
                // Rotate letters if they are facing outward
                lineStartAngle += (Math.PI * (inward ? 0 : 1)); // Rotate 180 if outward
                // Savepoint
                context.save();
                if (interactive) {
                    ghostContext.save();
                }
                // Assume starting angle
                if (!ghostOnly) {
                    context.rotate(lineStartAngle);
                }
                if (interactive) {
                    ghostContext.rotate(lineStartAngle);
                }
                let angleShift = 0;
                each$1(line.textChunks, (chunk, _index) => {
                    // Draw the letter
                    const char = chunk.text;
                    const charWidth = chunk.width;
                    // Rotate half a letter
                    angleShift = (charWidth / 2) / (radius - textHeight) * clockwise;
                    if (!ghostOnly) {
                        context.rotate(angleShift);
                    }
                    if (interactive) {
                        ghostContext.rotate(angleShift);
                    }
                    // Set style
                    if (chunk.style) {
                        context.save();
                        ghostContext.save();
                        if (!ghostOnly) {
                            context.font = chunk.style;
                        }
                        if (interactive) {
                            ghostContext.font = chunk.style;
                        }
                    }
                    if (chunk.fill) {
                        context.save();
                        if (!ghostOnly) {
                            context.fillStyle = chunk.fill.toCSS();
                        }
                        // Color does not affect ghostContext so we not set it
                    }
                    // Center letters
                    if (!ghostOnly) {
                        context.textBaseline = "middle";
                        context.textAlign = "center";
                    }
                    if (interactive) {
                        ghostContext.textBaseline = "middle";
                        ghostContext.textAlign = "center";
                    }
                    // Plop the letter
                    if (layerDirty && !ghostOnly) {
                        context.fillText(char, 0, (inward ? 1 : -1) * (0 - radius + textHeight / 2));
                    }
                    if (interactive && drawGhost) {
                        ghostContext.fillText(char, 0, (inward ? 1 : -1) * (0 - radius + textHeight / 2));
                    }
                    if (chunk.fill) {
                        context.restore();
                        // Color does not affect ghostContext so we not set it
                    }
                    // Reset style
                    if (chunk.style) {
                        context.restore();
                        ghostContext.restore();
                    }
                    // Rotate half a letter and add spacing
                    angleShift = (charWidth / 2 + kerning) / (radius - textHeight) * clockwise;
                    if (!ghostOnly) {
                        context.rotate(angleShift);
                    }
                    if (interactive) {
                        ghostContext.rotate(angleShift);
                    }
                });
                // Restore angle
                context.restore();
                if (interactive) {
                    ghostContext.restore();
                }
                // Adjust radius (for `inside = true`)
                if (inside) {
                    radius -= textHeight;
                }
            });
            // Restore
            context.restore();
            if (interactive) {
                ghostContext.restore();
            }
        }
    }
    _measure(status) {
        switch (this.textType) {
            case "circular":
                return this._measureCircular(status);
            default:
                return super._measure(status);
        }
    }
    _measureCircular(status) {
        const context = status.layer.context;
        const ghostContext = this._renderer._ghostLayer.context;
        const rtl = this.style.direction == "rtl";
        const oversizedBehavior = this.style.oversizedBehavior;
        const maxWidth = this.style.maxWidth;
        const truncate = isNumber(maxWidth) && oversizedBehavior == "truncate";
        const ellipsis = this.style.ellipsis || "";
        let ellipsisMetrics;
        //const wrap = $type.isNumber(maxWidth) && (oversizedBehavior == "wrap" || oversizedBehavior == "wrap-no-break");
        // Reset text info
        this.textVisible = true;
        this._textInfo = [];
        this._textReversed = false;
        // Pre-render
        context.save();
        ghostContext.save();
        this._prerender(status, true);
        // Split up text into lines
        const lines = this.text.toString().replace(/\r/g, "").split(/\n/);
        let styleRestored = true;
        let totalWidth = 0;
        // Iterate through the lines
        let offsetY = 0;
        each$1(lines, (line, _index) => {
            // Split up line into format/value chunks
            let chunks = TextFormatter.chunk(line, false, this.style.ignoreFormatting);
            // Init line object
            let lineInfo = {
                offsetY: offsetY,
                ascent: 0,
                width: 0,
                height: 0,
                left: 0,
                right: 0,
                textChunks: []
            };
            let currentStyle;
            let currentFill;
            let currentChunkWidth;
            //while(chunk = chunks.shift()) {
            each$1(chunks, (chunk, _index) => {
                // Format chunk
                if (chunk.type == "format") {
                    if (chunk.text == "[/]") {
                        if (!styleRestored) {
                            context.restore();
                            ghostContext.restore();
                            styleRestored = true;
                        }
                        currentFill = undefined;
                        currentStyle = undefined;
                        currentChunkWidth = undefined;
                    }
                    else {
                        let format = TextFormatter.getTextStyle(chunk.text);
                        const fontStyle = this._getFontStyle(format);
                        context.save();
                        ghostContext.save();
                        context.font = fontStyle;
                        currentStyle = fontStyle;
                        if (format.fill) {
                            currentFill = format.fill;
                        }
                        if (format.width) {
                            currentChunkWidth = toNumber(format.width);
                        }
                        styleRestored = false;
                    }
                    if (truncate) {
                        ellipsisMetrics = this._measureText(ellipsis, context);
                    }
                }
                // Text format
                else if (chunk.type == "value") {
                    // Measure each letter
                    let chars = chunk.text.match(/./ug) || [];
                    if (rtl) {
                        chars = splitString(chunk.text);
                        chars.reverse();
                    }
                    for (let i = 0; i < chars.length; i++) {
                        const char = chars[i];
                        // Measure
                        const metrics = this._measureText(char, context);
                        let chunkWidth = metrics.width;
                        // Chunk width?
                        if (currentStyle && currentChunkWidth && (currentChunkWidth > chunkWidth)) {
                            chunkWidth = currentChunkWidth;
                        }
                        const chunkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                        if (chunkHeight > lineInfo.height) {
                            lineInfo.height = chunkHeight;
                        }
                        if (metrics.actualBoundingBoxAscent > lineInfo.ascent) {
                            lineInfo.ascent = metrics.actualBoundingBoxAscent;
                        }
                        totalWidth += chunkWidth;
                        // Handle oversized behavior
                        if (truncate) {
                            // Measure ellipsis and check if it fits
                            if (!ellipsisMetrics) {
                                ellipsisMetrics = this._measureText(ellipsis, context);
                            }
                            const ellipsisWidth = ellipsisMetrics.actualBoundingBoxLeft + ellipsisMetrics.actualBoundingBoxRight;
                            //totalWidth += ellipsisWidth;
                            if ((totalWidth + ellipsisWidth) > maxWidth) {
                                if (lineInfo.textChunks.length == 1) {
                                    this.textVisible = false;
                                }
                                else {
                                    lineInfo.width += ellipsisWidth;
                                    lineInfo.left += ellipsisMetrics.actualBoundingBoxLeft;
                                    lineInfo.right += ellipsisMetrics.actualBoundingBoxRight;
                                    lineInfo.textChunks.push({
                                        style: currentStyle,
                                        fill: currentFill,
                                        text: ellipsis,
                                        width: ellipsisWidth,
                                        height: chunkHeight + ellipsisMetrics.actualBoundingBoxDescent,
                                        left: ellipsisMetrics.actualBoundingBoxLeft,
                                        right: ellipsisMetrics.actualBoundingBoxRight,
                                        ascent: ellipsisMetrics.actualBoundingBoxAscent,
                                        offsetX: 0,
                                        offsetY: chunkHeight,
                                        textDecoration: undefined
                                    });
                                }
                                break;
                            }
                        }
                        lineInfo.width += chunkWidth;
                        lineInfo.left += metrics.actualBoundingBoxLeft;
                        lineInfo.right += metrics.actualBoundingBoxRight;
                        lineInfo.textChunks.push({
                            style: currentStyle,
                            fill: currentFill,
                            text: char,
                            width: chunkWidth,
                            height: chunkHeight + metrics.actualBoundingBoxDescent,
                            left: metrics.actualBoundingBoxLeft,
                            right: metrics.actualBoundingBoxRight,
                            ascent: metrics.actualBoundingBoxAscent,
                            offsetX: 0,
                            offsetY: chunkHeight,
                            textDecoration: undefined
                        });
                    }
                }
            });
            if (this.style.lineHeight instanceof Percent) {
                lineInfo.height *= this.style.lineHeight.value;
            }
            else {
                lineInfo.height *= this.style.lineHeight || 1.2;
            }
            this._textInfo.push(lineInfo);
            //lineInfo.offsetY += lineInfo.ascent;
            offsetY += lineInfo.height;
        });
        if (!styleRestored) {
            context.restore();
            ghostContext.restore();
        }
        if (oversizedBehavior == "hide" && (totalWidth > maxWidth)) {
            this.textVisible = false;
        }
        // Adjust chunk internal offsets
        each$1(this._textInfo, (lineInfo) => {
            each$1(lineInfo.textChunks, (chunk) => {
                chunk.offsetY += Math.round((lineInfo.height - chunk.height + (lineInfo.ascent - chunk.ascent)) / 2);
            });
        });
        context.restore();
        ghostContext.restore();
        return {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
    }
}
/**
 * @ignore
 */
class CanvasImage extends CanvasDisplayObject {
    constructor(renderer, image) {
        super(renderer);
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tainted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowBlur", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOffsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOffsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shadowOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_imageMask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.image = image;
    }
    _dispose() {
        super._dispose();
        if (this._imageMask) {
            clearCanvas(this._imageMask);
        }
    }
    getLocalBounds() {
        if (!this._localBounds) {
            let w = 0;
            let h = 0;
            if (this.width) {
                w = this.width;
            }
            if (this.height) {
                h = this.height;
            }
            this._localBounds = {
                left: 0,
                top: 0,
                right: w,
                bottom: h
            };
            this._addBounds(this._localBounds);
        }
        return this._localBounds;
    }
    _render(status, targetGhostLayer = 0) {
        super._render(status);
        if (this.image) {
            if (this.tainted === undefined) {
                this.tainted = isTainted(this.image);
                status.layer.tainted = true;
            }
            if (this.tainted && this._renderer._omitTainted) {
                return;
            }
            const ghostOnly = this._ghostOnly(targetGhostLayer);
            const drawGhost = this._drawGhost(status, targetGhostLayer);
            if (status.layer.dirty && !ghostOnly) {
                if (this.shadowColor) {
                    status.layer.context.shadowColor = this.shadowColor.toCSS(this.shadowOpacity || 1);
                }
                if (this.shadowBlur) {
                    status.layer.context.shadowBlur = this.shadowBlur;
                }
                if (this.shadowOffsetX) {
                    status.layer.context.shadowOffsetX = this.shadowOffsetX;
                }
                if (this.shadowOffsetY) {
                    status.layer.context.shadowOffsetY = this.shadowOffsetY;
                }
                // TODO should this round ?
                const width = this.width || this.image.naturalWidth;
                const height = this.height || this.image.naturalHeight;
                status.layer.context.drawImage(this.image, 0, 0, width, height);
            }
            if (this.interactive && this._isInteractive(status) && drawGhost) {
                const mask = this._getMask(this.image);
                this._renderer._ghostLayer.context.drawImage(mask, 0, 0);
            }
        }
    }
    clear() {
        super.clear();
        this.image = undefined;
        this._imageMask = undefined;
    }
    _getMask(image) {
        if (this._imageMask === undefined) {
            // TODO should this round ?
            const width = this.width || image.naturalWidth;
            const height = this.height || image.naturalHeight;
            // We need to create a second canvas because destination-in clears out the entire canvas
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.fillStyle = this._getColorId();
            context.fillRect(0, 0, width, height);
            if (!isTainted(image)) {
                context.globalCompositeOperation = "destination-in";
                context.drawImage(image, 0, 0, width, height);
            }
            this._imageMask = canvas;
        }
        return this._imageMask;
    }
}
/**
 * @ignore
 */
class CanvasRendererEvent {
    constructor(event, originalPoint, point, bbox) {
        Object.defineProperty(this, "event", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: event
        });
        Object.defineProperty(this, "originalPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: originalPoint
        });
        Object.defineProperty(this, "point", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point
        });
        Object.defineProperty(this, "bbox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: bbox
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "simulated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "native", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        if (supports("touchevents") && event instanceof Touch) {
            this.id = event.identifier;
        }
        else {
            this.id = null;
        }
    }
}
/**
 * @ignore
 */
class CanvasRenderer extends ArrayDisposer {
    constructor(resolution) {
        super();
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.createElement("div")
        });
        Object.defineProperty(this, "_layerDom", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.createElement("div")
        });
        Object.defineProperty(this, "layers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_dirtyLayers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "defaultLayer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.getLayer(0)
        });
        Object.defineProperty(this, "_ghostLayer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new GhostLayer()
        });
        Object.defineProperty(this, "_deferredGhostLayers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_patternCanvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.createElement("canvas")
        });
        Object.defineProperty(this, "_patternContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._patternCanvas.getContext("2d")
        });
        Object.defineProperty(this, "_realWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_realHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_calculatedWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_calculatedHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "resolution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "interactionsEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_colorId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_colorMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_forceInteractive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_omitTainted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // TODO this should store the Id as well
        Object.defineProperty(this, "_hovering", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_dragging", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_mousedown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_lastPointerMoveEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tapToActivate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "tapToActivateTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3000
        });
        Object.defineProperty(this, "_touchActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_touchActiveTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (resolution == null) {
            this.resolution = window.devicePixelRatio;
        }
        else {
            this.resolution = resolution;
        }
        this.view.style.position = "absolute";
        this.view.setAttribute("aria-hidden", "true");
        this.view.appendChild(this._layerDom);
        this._disposers.push(new Disposer(() => {
            each(this._events, (_key, events) => {
                events.disposer.dispose();
            });
            each$1(this.layers, (layer) => {
                clearCanvas(layer.view);
                if (layer.exportableView) {
                    clearCanvas(layer.exportableView);
                }
            });
            clearCanvas(this._ghostLayer.view);
            clearCanvas(this._patternCanvas);
        }));
        /*
        this._disposers.push($utils.addEventListener(this._ghostLayer.view, "click", (originalEvent: MouseEvent) => {
            const event = this.getEvent(originalEvent);
            const target = this._getHitTarget(event.originalPoint, event.bbox);
            console.debug(target);
        }));
        */
        // Monitor for possible pixel ratio changes (when page is zoomed)
        this._disposers.push(onZoom(() => {
            if (resolution == null) {
                this.resolution = window.devicePixelRatio;
            }
        }));
        // We need this in order top prevent default touch gestures when dragging
        // draggable elements
        if (supports("touchevents")) {
            const listener = (ev) => {
                if (this._dragging.length !== 0) {
                    eachContinue$1(this._dragging, (item) => {
                        if (item.value.shouldCancelTouch()) {
                            ev.preventDefault();
                            return false;
                        }
                        return true;
                    });
                }
                // If touch down happends, delay touch out
                if (this._touchActiveTimeout) {
                    this._delayTouchDeactivate();
                }
            };
            this._disposers.push(addEventListener(window, "touchstart", listener, { passive: false }));
            this._disposers.push(addEventListener(this.view, "touchstart", listener, { passive: false }));
            this._disposers.push(addEventListener(this.view, "touchmove", () => {
                // If touch is moving, delay touch out
                if (this._touchActiveTimeout) {
                    this._delayTouchDeactivate();
                }
            }, { passive: true }));
            this._disposers.push(addEventListener(window, "click", (_ev) => {
                this._touchActive = false;
            }, { passive: true }));
            this._disposers.push(addEventListener(this.view, "click", (_ev) => {
                window.setTimeout(() => {
                    this._touchActive = true;
                    this._delayTouchDeactivate();
                }, 100);
            }, { passive: true }));
        }
        // Prevent scrolling of the window when hovering on "wheelable" object
        if (supports("wheelevents")) {
            this._disposers.push(addEventListener(this.view, "wheel", (ev) => {
                let prevent = false;
                this._hovering.forEach((obj) => {
                    if (obj.wheelable) {
                        prevent = true;
                        return false;
                    }
                });
                if (prevent) {
                    ev.preventDefault();
                }
            }, { passive: false }));
        }
    }
    /*protected _mouseMoveThrottler: Throttler = new Throttler(() => {
        this._dispatchGlobalMousemove(this._lastPointerMoveEvent.event, this._lastPointerMoveEvent.native);
    });
    */
    resetImageArray() {
        this._ghostLayer.imageArray = undefined;
    }
    _delayTouchDeactivate() {
        if (this._touchActiveTimeout) {
            clearTimeout(this._touchActiveTimeout);
        }
        if (this.tapToActivateTimeout > 0) {
            this._touchActiveTimeout = window.setTimeout(() => {
                this._touchActive = false;
            }, this.tapToActivateTimeout);
        }
    }
    get debugGhostView() {
        return !!this._ghostLayer.view.parentNode;
    }
    set debugGhostView(value) {
        if (value) {
            if (!this._ghostLayer.view.parentNode) {
                this.view.appendChild(this._ghostLayer.view);
            }
        }
        else {
            if (this._ghostLayer.view.parentNode) {
                this._ghostLayer.view.parentNode.removeChild(this._ghostLayer.view);
            }
        }
    }
    createLinearGradient(x1, y1, x2, y2) {
        return this.defaultLayer.context.createLinearGradient(x1, y1, x2, y2);
    }
    createRadialGradient(x1, y1, radius1, x2, y2, radius2) {
        return this.defaultLayer.context.createRadialGradient(x1, y1, radius1, x2, y2, radius2);
    }
    createPattern(graphics, background, repetition, width, height) {
        // const patternCanvas = document.createElement("canvas");
        // const patternContext = patternCanvas.getContext("2d")!;
        // patternCanvas.width = width;
        // patternCanvas.height = height;
        // if (fill) {
        // 	patternContext.fillStyle = fill.toCSS();
        // 	patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
        // }
        // const layer = {
        // 	view: patternCanvas,
        // 	context: patternContext,
        // 	visible: true,
        // 	order: 0,
        // 	width: width,
        // 	height: height,
        // 	dirty: true
        // };
        // // patternContext.arc(0, 0, 50, 0, .5 * Math.PI);
        // // patternContext.stroke();
        // image.targetLayer = layer;
        // image.render(layer);
        //this._layerDom.appendChild(patternCanvas);
        this._patternCanvas.width = width;
        this._patternCanvas.height = height;
        this._patternContext.clearRect(0, 0, width, height);
        // patternCanvas.style.width = width * this.resolution + "px";
        // patternCanvas.style.height = height * this.resolution + "px";
        background.renderDetached(this._patternContext);
        graphics.renderDetached(this._patternContext);
        return this._patternContext.createPattern(this._patternCanvas, repetition);
    }
    makeContainer() {
        return new CanvasContainer(this);
    }
    makeGraphics() {
        return new CanvasGraphics(this);
    }
    makeText(text, style) {
        return new CanvasText(this, text, style);
    }
    makeTextStyle() {
        return new CanvasTextStyle();
    }
    makeRadialText(text, style) {
        return new CanvasRadialText(this, text, style);
    }
    makePicture(image) {
        return new CanvasImage(this, image);
    }
    resizeLayer(layer) {
        layer.resize(this._calculatedWidth, this._calculatedHeight, this._calculatedWidth, this._calculatedHeight, this.resolution);
    }
    resizeGhost() {
        this._ghostLayer.resize(this._calculatedWidth, this._calculatedHeight, this._calculatedWidth, this._calculatedHeight, this.resolution);
    }
    resize(realWidth, realHeight, calculatedWidth, calculatedHeight) {
        this._realWidth = realWidth;
        this._realHeight = realHeight;
        this._calculatedWidth = calculatedWidth;
        this._calculatedHeight = calculatedHeight;
        each$1(this.layers, (layer) => {
            if (layer) {
                layer.dirty = true;
                this.resizeLayer(layer);
            }
        });
        this.resizeGhost();
        this.view.style.width = calculatedWidth + "px";
        this.view.style.height = calculatedHeight + "px";
    }
    createDetachedLayer(willReadFrequently = false) {
        const view = document.createElement("canvas");
        const context = view.getContext("2d", { willReadFrequently: willReadFrequently });
        const layer = new CanvasLayer(view, context);
        view.style.position = "absolute";
        view.style.top = "0px";
        view.style.left = "0px";
        return layer;
    }
    getLayerByOrder(order) {
        const layers = this.layers;
        const length = layers.length;
        for (let i = 0; i < length; i++) {
            const layer = layers[i];
            if (layer.order == order) {
                return layer;
            }
        }
    }
    getLayer(order, visible = true) {
        let existingLayer = this.getLayerByOrder(order);
        if (existingLayer) {
            return existingLayer;
        }
        const layer = this.createDetachedLayer(order == 99);
        layer.order = order;
        layer.visible = visible;
        layer.view.className = "am5-layer-" + order;
        if (layer.visible) {
            this.resizeLayer(layer);
        }
        const layers = this.layers;
        layers.push(layer);
        layers.sort((a, b) => {
            if (a.order > b.order) {
                return 1;
            }
            else if (a.order < b.order) {
                return -1;
            }
            else {
                return 0;
            }
        });
        const length = layers.length;
        const layerIndex = indexOf(layers, layer);
        let next;
        for (let i = layerIndex + 1; i < length; i++) {
            if (layers[i].visible) {
                next = layers[i];
                break;
            }
        }
        if (layer.visible) {
            if (next === undefined) {
                this._layerDom.appendChild(layer.view);
            }
            else {
                this._layerDom.insertBefore(layer.view, next.view);
            }
        }
        return layer;
    }
    render(root) {
        this._dirtyLayers.length = 0;
        this._deferredGhostLayers = [];
        each$1(this.layers, (layer) => {
            if (layer) {
                if (layer.dirty && layer.visible) {
                    this._dirtyLayers.push(layer);
                    layer.clear();
                }
            }
        });
        this._ghostLayer.clear();
        root.render({
            inactive: null,
            layer: this.defaultLayer,
        });
        const deferredGhostLayers = this._deferredGhostLayers;
        if (deferredGhostLayers.length) {
            deferredGhostLayers.sort((a, b) => a - b);
            each$1(deferredGhostLayers, (layerx) => {
                root.render({
                    inactive: null,
                    layer: this.defaultLayer
                }, layerx);
            });
        }
        this._ghostLayer.context.restore();
        //setTimeout(() => {
        // Remove this after the Chrome bug is fixed:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1279394
        each$1(this.layers, (layer) => {
            if (layer) {
                const context = layer.context;
                context.beginPath();
                context.moveTo(0, 0);
                context.stroke();
            }
        });
        each$1(this._dirtyLayers, (layer) => {
            layer.context.restore();
            layer.dirty = false;
        });
        //}, 100)
        if (this._hovering.size && this._lastPointerMoveEvent) {
            const { events, target, native } = this._lastPointerMoveEvent;
            //this._mouseMoveThrottler.run();
            each$1(events, (event) => {
                this._dispatchGlobalMousemove(event, target, native);
            });
        }
    }
    paintId(obj) {
        const id = distributeId(++this._colorId);
        const color = Color.fromHex(id).toCSS();
        this._colorMap[color] = obj;
        return color;
    }
    _removeObject(obj) {
        if (obj._colorId !== undefined) {
            delete this._colorMap[obj._colorId];
        }
    }
    // protected _identifyObjectByColor(colorId: number): CanvasDisplayObject | undefined {
    // 	return this._colorMap[colorId];
    // }
    _adjustBoundingBox(bbox) {
        const margin = this._ghostLayer.margin;
        return new DOMRect(-margin.left, -margin.top, bbox.width + margin.left + margin.right, bbox.height + margin.top + margin.bottom);
    }
    getEvent(originalEvent, adjustPoint = true) {
        const bbox = this.view.getBoundingClientRect();
        const x = originalEvent.clientX || 0;
        const y = originalEvent.clientY || 0;
        const widthScale = this._calculatedWidth / this._realWidth;
        const heightScale = this._calculatedHeight / this._realHeight;
        const originalPoint = {
            x: x - bbox.left,
            y: y - bbox.top,
        };
        const point = {
            x: (x - (adjustPoint ? bbox.left : 0)) * widthScale,
            y: (y - (adjustPoint ? bbox.top : 0)) * heightScale,
        };
        return new CanvasRendererEvent(originalEvent, originalPoint, point, this._adjustBoundingBox(bbox));
    }
    _getHitTarget(point, bbox, target) {
        if (bbox.width === 0 || bbox.height === 0 || point.x < bbox.left || point.x > bbox.right || point.y < bbox.top || point.y > bbox.bottom) {
            return;
        }
        if (!target || !this._layerDom.contains(target)) {
            return;
        }
        const pixel = this._ghostLayer.getImageData(point, bbox);
        if (pixel.data[0] === 0 && pixel.data[1] === 0 && pixel.data[2] === 0) {
            return false;
        }
        const colorId = Color.fromRGB(pixel.data[0], pixel.data[1], pixel.data[2]).toCSS();
        const hit = this._colorMap[colorId];
        return hit;
    }
    getObjectAtPoint(point) {
        const data = this._ghostLayer.getImageArray(point);
        if (data[0] === 0 && data[1] === 0 && data[2] === 0) {
            return undefined;
        }
        const colorId = Color.fromRGB(data[0], data[1], data[2]).toCSS();
        const hit = this._colorMap[colorId];
        return hit;
    }
    _withEvents(key, f) {
        const events = this._events[key];
        if (events !== undefined) {
            events.dispatching = true;
            try {
                f(events);
            }
            finally {
                events.dispatching = false;
                if (events.cleanup) {
                    events.cleanup = false;
                    keepIf(events.callbacks, (callback) => {
                        return !callback.disposed;
                    });
                    if (events.callbacks.length === 0) {
                        events.disposer.dispose();
                        delete this._events[key];
                    }
                }
            }
        }
    }
    _dispatchEventAll(key, event) {
        if (!this.interactionsEnabled) {
            return;
        }
        this._withEvents(key, (events) => {
            each$1(events.callbacks, (callback) => {
                if (!callback.disposed) {
                    callback.callback.call(callback.context, event);
                }
            });
        });
    }
    _dispatchEvent(key, target, event) {
        if (!this.interactionsEnabled) {
            return false;
        }
        let dispatched = false;
        this._withEvents(key, (events) => {
            each$1(events.callbacks, (callback) => {
                if (!callback.disposed && callback.object === target) {
                    callback.callback.call(callback.context, event);
                    dispatched = true;
                }
            });
        });
        return dispatched;
    }
    _dispatchMousedown(originalEvent, originalTarget) {
        const button = originalEvent.button;
        if (button != 0 && button != 2 && button != 1 && button !== undefined) {
            // Ignore non-primary mouse buttons
            return;
        }
        const event = this.getEvent(originalEvent);
        const target = this._getHitTarget(event.originalPoint, event.bbox, originalTarget);
        if (target) {
            const id = event.id;
            let dragged = false;
            eachTargets(target, (obj) => {
                const info = { id: id, value: obj };
                this._mousedown.push(info);
                if (!dragged && this._dispatchEvent("pointerdown", obj, event)) {
                    // Only dispatch the first element which matches
                    dragged = true;
                    const has = this._dragging.some((x) => {
                        return x.value === obj && x.id === id;
                    });
                    if (!has) {
                        this._dragging.push(info);
                    }
                }
                return true;
            });
        }
    }
    _dispatchGlobalMousemove(originalEvent, originalTarget, native) {
        const event = this.getEvent(originalEvent);
        const target = this._getHitTarget(event.originalPoint, event.bbox, originalTarget);
        event.native = native;
        if (target) {
            this._hovering.forEach((obj) => {
                if (!obj.contains(target)) {
                    this._hovering.delete(obj);
                    if (obj.cursorOverStyle) {
                        setStyle(document.body, "cursor", obj._replacedCursorStyle);
                    }
                    this._dispatchEvent("pointerout", obj, event);
                }
            });
            if (event.native) {
                eachTargets(target, (obj) => {
                    if (!this._hovering.has(obj)) {
                        this._hovering.add(obj);
                        if (obj.cursorOverStyle) {
                            obj._replacedCursorStyle = getStyle(document.body, "cursor");
                            setStyle(document.body, "cursor", obj.cursorOverStyle);
                        }
                        this._dispatchEvent("pointerover", obj, event);
                    }
                    return true;
                });
            }
            //} else if (target === false) {
        }
        else {
            this._hovering.forEach((obj) => {
                if (obj.cursorOverStyle) {
                    setStyle(document.body, "cursor", obj._replacedCursorStyle);
                }
                this._dispatchEvent("pointerout", obj, event);
            });
            this._hovering.clear();
        }
        this._dispatchEventAll("globalpointermove", event);
    }
    removeHovering(graphics) {
        this._hovering.delete(graphics);
        if (graphics.cursorOverStyle) {
            setStyle(document.body, "cursor", graphics._replacedCursorStyle);
        }
    }
    _dispatchGlobalMouseup(originalEvent, native) {
        const event = this.getEvent(originalEvent);
        event.native = native;
        //const target = this._getHitTarget(event.originalPoint);
        this._dispatchEventAll("globalpointerup", event);
    }
    _dispatchDragMove(originalEvent) {
        if (this._dragging.length !== 0) {
            const event = this.getEvent(originalEvent);
            const id = event.id;
            this._dragging.forEach((obj) => {
                if (obj.id === id) {
                    this._dispatchEvent("pointermove", obj.value, event);
                }
            });
        }
    }
    _dispatchDragEnd(originalEvent, originalTarget) {
        const button = originalEvent.button;
        let clickevent;
        if (button == 0 || button === undefined) {
            clickevent = "click";
        }
        else if (button == 2) {
            clickevent = "rightclick";
        }
        else if (button == 1) {
            clickevent = "middleclick";
        }
        else {
            // Ignore non-primary mouse buttons
            return;
        }
        const event = this.getEvent(originalEvent);
        const id = event.id;
        if (this._mousedown.length !== 0) {
            const target = this._getHitTarget(event.originalPoint, event.bbox, originalTarget);
            if (target) {
                this._mousedown.forEach((obj) => {
                    if (obj.id === id && obj.value.contains(target)) {
                        this._dispatchEvent(clickevent, obj.value, event);
                    }
                });
            }
            this._mousedown.length = 0;
        }
        if (this._dragging.length !== 0) {
            this._dragging.forEach((obj) => {
                if (obj.id === id) {
                    this._dispatchEvent("pointerup", obj.value, event);
                }
            });
            this._dragging.length = 0;
        }
    }
    _dispatchDoubleClick(originalEvent, originalTarget) {
        const event = this.getEvent(originalEvent);
        const target = this._getHitTarget(event.originalPoint, event.bbox, originalTarget);
        if (target) {
            eachTargets(target, (obj) => {
                if (this._dispatchEvent("dblclick", obj, event)) {
                    return false;
                }
                else {
                    return true;
                }
            });
        }
    }
    _dispatchWheel(originalEvent, originalTarget) {
        const event = this.getEvent(originalEvent);
        const target = this._getHitTarget(event.originalPoint, event.bbox, originalTarget);
        if (target) {
            eachTargets(target, (obj) => {
                if (this._dispatchEvent("wheel", obj, event)) {
                    return false;
                }
                else {
                    return true;
                }
            });
        }
    }
    _makeSharedEvent(key, f) {
        if (this._listeners[key] === undefined) {
            const listener = f();
            this._listeners[key] = new CounterDisposer(() => {
                delete this._listeners[key];
                listener.dispose();
            });
        }
        return this._listeners[key].increment();
    }
    _onPointerEvent(name, f) {
        let native = false;
        let timer = null;
        function clear() {
            timer = null;
            native = false;
        }
        return new MultiDisposer([
            new Disposer(() => {
                if (timer !== null) {
                    clearTimeout(timer);
                }
                clear();
            }),
            addEventListener(this.view, getRendererEvent(name), (_) => {
                native = true;
                if (timer !== null) {
                    clearTimeout(timer);
                }
                timer = window.setTimeout(clear, 0);
            }),
            onPointerEvent(window, name, (ev, target) => {
                if (timer !== null) {
                    clearTimeout(timer);
                    timer = null;
                }
                f(ev, target, native);
                native = false;
            }),
        ]);
    }
    // This ensures that only a single DOM event is added (e.g. only a single mousemove event listener)
    _initEvent(key) {
        switch (key) {
            case "globalpointermove":
            case "pointerover":
            case "pointerout":
                return this._makeSharedEvent("pointermove", () => {
                    const listener = (events, target, native) => {
                        this._lastPointerMoveEvent = { events, target, native };
                        each$1(events, (event) => {
                            this._dispatchGlobalMousemove(event, target, native);
                        });
                    };
                    return new MultiDisposer([
                        this._onPointerEvent("pointerdown", listener),
                        this._onPointerEvent("pointermove", listener),
                    ]);
                });
            case "globalpointerup":
                return this._makeSharedEvent("pointerup", () => {
                    const mouseup = this._onPointerEvent("pointerup", (events, target, native) => {
                        each$1(events, (event) => {
                            this._dispatchGlobalMouseup(event, native);
                        });
                        this._lastPointerMoveEvent = { events, target, native };
                    });
                    const pointercancel = this._onPointerEvent("pointercancel", (events, target, native) => {
                        each$1(events, (event) => {
                            this._dispatchGlobalMouseup(event, native);
                        });
                        this._lastPointerMoveEvent = { events, target, native };
                    });
                    return new Disposer(() => {
                        mouseup.dispose();
                        pointercancel.dispose();
                    });
                });
            case "click":
            case "rightclick":
            case "middleclick":
            case "pointerdown":
            /*
                return this._makeSharedEvent("pointerdown", () => {
                    return this._onPointerEvent("pointerdown", (event, target, native) => {
                        this._lastPointerMoveEvent = { event, target, native };
                        this._dispatchMousedown(event)
                    });
                });
            */
            case "pointermove":
            case "pointerup":
                return this._makeSharedEvent("pointerdown", () => {
                    //const throttler = new Throttler();
                    const mousedown = this._onPointerEvent("pointerdown", (events, target) => {
                        each$1(events, (ev) => {
                            this._dispatchMousedown(ev, target);
                        });
                    });
                    // TODO handle throttling properly for multitouch
                    const mousemove = this._onPointerEvent("pointermove", (ev) => {
                        //throttler.throttle(() => {
                        each$1(ev, (ev) => {
                            this._dispatchDragMove(ev);
                        });
                        //});
                    });
                    const mouseup = this._onPointerEvent("pointerup", (ev, target) => {
                        each$1(ev, (ev) => {
                            this._dispatchDragEnd(ev, target);
                        });
                    });
                    const pointercancel = this._onPointerEvent("pointercancel", (ev, target) => {
                        each$1(ev, (ev) => {
                            this._dispatchDragEnd(ev, target);
                        });
                    });
                    return new Disposer(() => {
                        mousedown.dispose();
                        mousemove.dispose();
                        mouseup.dispose();
                        pointercancel.dispose();
                    });
                });
            case "dblclick":
                return this._makeSharedEvent("dblclick", () => {
                    return this._onPointerEvent("dblclick", (ev, target) => {
                        each$1(ev, (ev) => {
                            this._dispatchDoubleClick(ev, target);
                        });
                    });
                });
            case "wheel":
                return this._makeSharedEvent("wheel", () => {
                    return addEventListener(this.view, getRendererEvent("wheel"), (event) => {
                        this._dispatchWheel(event, getEventTarget(event));
                    }, { passive: false });
                });
        }
    }
    _addEvent(object, key, callback, context) {
        let events = this._events[key];
        if (events === undefined) {
            events = this._events[key] = {
                disposer: this._initEvent(key),
                callbacks: [],
                dispatching: false,
                cleanup: false,
            };
        }
        const listener = { object, context, callback, disposed: false };
        events.callbacks.push(listener);
        return new Disposer(() => {
            listener.disposed = true;
            if (events.dispatching) {
                events.cleanup = true;
            }
            else {
                removeFirst(events.callbacks, listener);
                if (events.callbacks.length === 0) {
                    events.disposer.dispose();
                    delete this._events[key];
                }
            }
        });
    }
    getCanvas(root, options) {
        // Make sure everything is rendered
        this.render(root);
        if (!options) {
            options = {};
        }
        let scale = this.resolution;
        let canvasWidth = Math.floor(this._calculatedWidth * this.resolution);
        let canvasHeight = Math.floor(this._calculatedHeight * this.resolution);
        // Check if we need to scale
        if (options.minWidth && (options.minWidth > canvasWidth)) {
            let minScale = options.minWidth / canvasWidth;
            if (minScale > scale) {
                scale = minScale * this.resolution;
            }
        }
        if (options.minHeight && (options.minHeight > canvasHeight)) {
            let minScale = options.minHeight / canvasHeight;
            if (minScale > scale) {
                scale = minScale * this.resolution;
            }
        }
        if (options.maxWidth && (options.maxWidth < canvasWidth)) {
            let maxScale = options.maxWidth / canvasWidth;
            if (maxScale < scale) {
                scale = maxScale * this.resolution;
            }
        }
        if (options.maxHeight && (options.maxHeight > canvasHeight)) {
            let maxScale = options.maxHeight / canvasHeight;
            if (maxScale < scale) {
                scale = maxScale * this.resolution;
            }
        }
        // Check if we need to compensate for pixel ratio
        if (options.maintainPixelRatio) {
            scale /= this.resolution;
        }
        // Init list canvases to remove from DOM after export
        const canvases = [];
        // Set up new canvas for export
        let forceRender = false;
        const canvas = document.createElement("canvas");
        if (scale != this.resolution) {
            forceRender = true;
            canvasWidth = canvasWidth * scale / this.resolution;
            canvasHeight = canvasHeight * scale / this.resolution;
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // Add to DOM so it inherits CSS
        canvas.style.position = "fixed";
        canvas.style.top = "-10000px";
        this.view.appendChild(canvas);
        canvases.push(canvas);
        // Context
        const context = canvas.getContext("2d");
        let width = 0;
        let height = 0;
        let needRerender = false;
        each$1(this.layers, (layer) => {
            if (layer && layer.visible) {
                if (layer.tainted || forceRender) {
                    needRerender = true;
                    layer.exportableView = layer.view;
                    layer.exportableContext = layer.context;
                    layer.view = document.createElement("canvas");
                    // Add to DOM so it inherits CSS
                    layer.view.style.position = "fixed";
                    layer.view.style.top = "-10000px";
                    this.view.appendChild(layer.view);
                    canvases.push(layer.view);
                    let extraX = 0;
                    let extraY = 0;
                    if (layer.margin) {
                        extraX += layer.margin.left || 0 + layer.margin.right || 0;
                        extraY += layer.margin.top || 0 + layer.margin.bottom || 0;
                    }
                    layer.view.width = canvasWidth + extraX;
                    layer.view.height = canvasHeight + extraY;
                    layer.context = layer.view.getContext("2d");
                    layer.dirty = true;
                    layer.scale = scale;
                }
            }
        });
        if (needRerender) {
            this._omitTainted = true;
            this.render(root);
            this._omitTainted = false;
        }
        each$1(this.layers, (layer) => {
            if (layer && layer.visible) {
                // Layer is fine. Just plop it into our target canvas
                let x = 0;
                let y = 0;
                if (layer.margin) {
                    x = -(layer.margin.left || 0) * this.resolution;
                    y = -(layer.margin.top || 0) * this.resolution;
                }
                context.drawImage(layer.view, x, y);
                // Restore layer original canvas
                if (layer.exportableView) {
                    layer.view = layer.exportableView;
                    layer.exportableView = undefined;
                }
                if (layer.exportableContext) {
                    layer.context = layer.exportableContext;
                    layer.exportableContext = undefined;
                }
                if (width < layer.view.clientWidth) {
                    width = layer.view.clientWidth;
                }
                if (height < layer.view.clientHeight) {
                    height = layer.view.clientHeight;
                }
                layer.scale = undefined;
            }
        });
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        each$1(canvases, (canvas) => {
            canvas.style.position = "";
            canvas.style.top = "";
            this.view.removeChild(canvas);
        });
        return canvas;
    }
}
class GhostLayer {
    constructor() {
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "margin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            }
        });
        Object.defineProperty(this, "_resolution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "_width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "imageArray", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.view = document.createElement("canvas");
        this.context = this.view.getContext("2d", { alpha: false, willReadFrequently: true });
        this.context.imageSmoothingEnabled = false;
        this.view.style.position = "absolute";
        this.view.style.top = "0px";
        this.view.style.left = "0px";
    }
    resize(canvasWidth, canvasHeight, domWidth, domHeight, resolution) {
        this._resolution = resolution;
        canvasWidth += (this.margin.left + this.margin.right);
        canvasHeight += (this.margin.top + this.margin.bottom);
        // TODO this should take into account calculateSize
        domWidth += (this.margin.left + this.margin.right);
        domHeight += (this.margin.top + this.margin.bottom);
        this.view.style.left = -this.margin.left + "px";
        this.view.style.top = -this.margin.top + "px";
        this._width = Math.floor(canvasWidth * resolution);
        this._height = Math.floor(canvasHeight * resolution);
        this.view.width = this._width;
        this.view.style.width = domWidth + "px";
        this.view.height = this._height;
        this.view.style.height = domHeight + "px";
    }
    getImageData(point, bbox) {
        return this.context.getImageData(
        // TODO should this round ?
        Math.round(((point.x - bbox.left) / bbox.width) * this._width), Math.round(((point.y - bbox.top) / bbox.height) * this._height), 1, 1);
    }
    getImageArray(point) {
        if (!this.imageArray) {
            this.imageArray = this.context.getImageData(0, 0, this._width, this._height).data;
        }
        const data = this.imageArray;
        const x = Math.round(point.x * this._resolution);
        const y = Math.round(point.y * this._resolution);
        const i = (y * this._width + x) * 4;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    }
    setMargin(layers) {
        this.margin.left = 0;
        this.margin.right = 0;
        this.margin.top = 0;
        this.margin.bottom = 0;
        each$1(layers, (layer) => {
            if (layer.margin) {
                this.margin.left = Math.max(this.margin.left, layer.margin.left);
                this.margin.right = Math.max(this.margin.right, layer.margin.right);
                this.margin.top = Math.max(this.margin.top, layer.margin.top);
                this.margin.bottom = Math.max(this.margin.bottom, layer.margin.bottom);
            }
        });
    }
    clear() {
        this.context.save();
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this._width, this._height);
    }
}
/**
 * @ignore
 */
class CanvasLayer {
    constructor(view, context) {
        Object.defineProperty(this, "view", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tainted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "margin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "visible", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "exportableView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "exportableContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.view = view;
        this.context = context;
    }
    resize(canvasWidth, canvasHeight, domWidth, domHeight, resolution) {
        // TODO should this take into account calculateSize ?
        if (this.width != null) {
            canvasWidth = this.width;
            domWidth = this.width;
        }
        // TODO should this take into account calculateSize ?
        if (this.height != null) {
            canvasHeight = this.height;
            domHeight = this.height;
        }
        if (this.margin) {
            canvasWidth += (this.margin.left + this.margin.right);
            canvasHeight += (this.margin.top + this.margin.bottom);
            // TODO this should take into account calculateSize
            domWidth += (this.margin.left + this.margin.right);
            domHeight += (this.margin.top + this.margin.bottom);
            this.view.style.left = -this.margin.left + "px";
            this.view.style.top = -this.margin.top + "px";
        }
        else {
            this.view.style.left = "0px";
            this.view.style.top = "0px";
        }
        this._width = Math.floor(canvasWidth * resolution);
        this._height = Math.floor(canvasHeight * resolution);
        this.view.width = this._width;
        this.view.style.width = domWidth + "px";
        this.view.height = this._height;
        this.view.style.height = domHeight + "px";
    }
    clear() {
        this.context.save();
        this.context.clearRect(0, 0, this._width, this._height);
    }
}

function rAF(fps, callback) {
    if (fps == null) {
        requestAnimationFrame(callback);
    }
    else {
        setTimeout(() => {
            requestAnimationFrame(callback);
        }, 1000 / fps);
    }
}
// TODO implement Disposer
/**
 * Root element of the chart.
 *
 * @see {@link https://www.amcharts.com/docs/v5/getting-started/#Root_element} for more info
 */
class Root {
    constructor(id, settings = {}, isReal) {
        /**
         * A reference to original chart container (div element).
         */
        Object.defineProperty(this, "dom", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_inner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isDirtyParents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isDirtyAnimation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_dirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dirtyParents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dirtyBounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_dirtyPositions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_ticker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_tickers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_updateTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /**
         * Root's event dispatcher.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/events/} for more info
         */
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventDispatcher()
        });
        /**
         * @ignore
         * @todo needs description
         */
        Object.defineProperty(this, "animationTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_animations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_rootContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Main content container.
         */
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * A [[Container]] used to display tooltips in.
         */
        Object.defineProperty(this, "tooltipContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipContainerSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltip", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Locale-related
        /**
         * @ignore
         */
        Object.defineProperty(this, "language", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Language.new(this, {})
        });
        /**
         * Locale used by the chart.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/locales/}
         */
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: en
        });
        // Date-time related
        /**
         * Use UTC when formatting date/time.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-dates/#utc-and-time-zones} for more info
         */
        Object.defineProperty(this, "utc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * If set, will format date/time in specific time zone.
         *
         * The value should be named time zone, e.g.:
         * `"America/Vancouver"`, `"Australia/Sydney"`, `"UTC"`.
         *
         * NOTE: Using time zone feature may noticeable affect performance of the
         * chart, especially with large data sets, since every single date will need
         * to be recalculated.
         *
         * @see {@link https://www.amcharts.com/docs/v5/getting-started/root-element/#time-zone} for more info
         * @since 5.1.0
         */
        Object.defineProperty(this, "timezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * The maximum FPS that the Root will run at.
         *
         * If `undefined` it will run at the highest FPS.
         *
         * @see {@link https://www.amcharts.com/docs/v5/getting-started/root-element/#Performance} for more info
         */
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Number formatter.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-numbers/} for more info
         */
        Object.defineProperty(this, "numberFormatter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: NumberFormatter.new(this, {})
        });
        /**
         * Date/time formatter.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-dates/} for more info
         */
        Object.defineProperty(this, "dateFormatter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DateFormatter.new(this, {})
        });
        /**
         * Duration formatter.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/formatters/formatting-dates/} for more info
         */
        Object.defineProperty(this, "durationFormatter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DurationFormatter.new(this, {})
        });
        // Accessibility
        /**
         * Global tab index for using for the whole chart
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/accessibility/} for more info
         */
        Object.defineProperty(this, "tabindex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        //@todo maybe make this better
        Object.defineProperty(this, "_tabindexes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_a11yD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_focusElementDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_focusElementContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_focusedSprite", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isShift", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_keyboardDragPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipElementContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_readerAlertElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_skipNextGroupJump", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_logo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltipDiv", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Used for dynamically-created CSS and JavaScript with strict source policies.
         */
        Object.defineProperty(this, "nonce", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Special color set to be used for various controls.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/#Interface_colors} for more info
         */
        Object.defineProperty(this, "interfaceColors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * An instance of vertical layout object that can be used to set `layout` setting
         * of a [[Container]].
         *
         * @default VerticalLayout.new()
         */
        Object.defineProperty(this, "verticalLayout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: VerticalLayout.new(this, {})
        });
        /**
         * An instance of horizontal layout object that can be used to set `layout` setting
         * of a [[Container]].
         *
         * @default HorizontalLayout.new()
         */
        Object.defineProperty(this, "horizontalLayout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: HorizontalLayout.new(this, {})
        });
        /**
         * An instance of grid layout object that can be used to set `layout` setting
         * of a [[Container]].
         *
         * @default VerticalLayout.new()
         */
        Object.defineProperty(this, "gridLayout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: GridLayout.new(this, {})
        });
        Object.defineProperty(this, "_paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * Indicates whether chart should resized automatically when parent container
         * width and/or height changes.
         *
         * If disabled (`autoResize = false`) you can make the chart resize manually
         * by calling root element's `resize()` method.
         */
        Object.defineProperty(this, "autoResize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_fontHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "_isDisposed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_disposers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_resizeSensorDisposer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tooltips", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_htmlElementContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_htmlEnabledContainers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /**
         * Entities that have their `id` setting set.
         *
         * @since 5.11.0
         */
        Object.defineProperty(this, "entitiesById", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_systemTooltip", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!isReal) {
            throw new Error("You cannot use `new Class()`, instead use `Class.new()`");
        }
        this._settings = settings;
        if (settings.accessible == false) {
            this._a11yD = true;
        }
        if (settings.useSafeResolution == null) {
            settings.useSafeResolution = true;
        }
        let resolution;
        if (settings.useSafeResolution) {
            resolution = getSafeResolution();
        }
        this._renderer = new CanvasRenderer(resolution);
        let dom;
        if (id instanceof HTMLElement) {
            dom = id;
        }
        else {
            dom = document.getElementById(id);
        }
        each$1(registry.rootElements, (root) => {
            if (root.dom === dom) {
                throw new Error("You cannot have multiple Roots on the same DOM node");
            }
        });
        this.interfaceColors = InterfaceColors.new(this, {});
        if (dom === null) {
            throw new Error("Could not find HTML element with id `" + id + "`");
        }
        this.dom = dom;
        let inner = document.createElement("div");
        inner.style.position = "relative";
        inner.style.width = "100%";
        inner.style.height = "100%";
        dom.appendChild(inner);
        const tooltipContainerBounds = settings.tooltipContainerBounds;
        if (tooltipContainerBounds) {
            this._tooltipContainerSettings = tooltipContainerBounds;
        }
        this._inner = inner;
        this._updateComputedStyles();
        registry.rootElements.push(this);
    }
    static new(id, settings) {
        const root = new Root(id, settings, true);
        root._init();
        return root;
    }
    moveDOM(id) {
        let dom;
        if (id instanceof HTMLElement) {
            dom = id;
        }
        else {
            dom = document.getElementById(id);
        }
        if (dom) {
            while (this.dom.childNodes.length > 0) {
                dom.appendChild(this.dom.childNodes[0]);
            }
            this.dom = dom;
            this._initResizeSensor();
            this.resize();
        }
    }
    _handleLogo() {
        if (this._logo) {
            const w = this.dom.offsetWidth;
            const h = this.dom.offsetHeight;
            if ((w <= 150) || (h <= 60)) {
                this._logo.hide();
            }
            else {
                this._logo.show();
            }
        }
    }
    _showBranding() {
        if (!this._logo) {
            const logo = this.tooltipContainer.children.push(Container.new(this, {
                interactive: true,
                interactiveChildren: false,
                position: "absolute",
                setStateOnChildren: true,
                paddingTop: 9,
                paddingRight: 9,
                paddingBottom: 9,
                paddingLeft: 9,
                scale: .6,
                y: percent(100),
                centerY: p100,
                tooltipY: 10,
                tooltipText: "Created using amCharts 5",
                tooltipX: p100,
                cursorOverStyle: "pointer",
                background: Rectangle.new(this, {
                    fill: color(0x474758),
                    fillOpacity: 0,
                    tooltipY: 5
                })
            }));
            logo.set("tooltip", this.systemTooltip);
            logo.events.on("click", () => {
                window.open("https://www.amcharts.com/", "_blank");
            });
            logo.states.create("hover", {});
            const m = logo.children.push(Graphics.new(this, {
                stroke: color(0xcccccc),
                strokeWidth: 3,
                svgPath: "M5 25 L13 25h13.6c3.4 0 6 0 10.3-4.3s5.2-12 8.6-12c3.4 0 4.3 8.6 7.7 8.6M83.4 25H79.8c-3.4 0-6 0-10.3-4.3s-5.2-12-8.6-12-4.3 8.6-7.7 8.6"
            }));
            m.states.create("hover", { stroke: color(0x3CABFF) });
            const a = logo.children.push(Graphics.new(this, {
                stroke: color(0x888888),
                strokeWidth: 3,
                svgPath: "M83.4 25h-31C37 25 39.5 4.4 28.4 4.4S18.9 24.2 4.3 25H0"
            }));
            a.states.create("hover", { stroke: color(0x474758) });
            this._logo = logo;
            this._handleLogo();
        }
    }
    _getRealSize() {
        return this.dom.getBoundingClientRect();
    }
    _getCalculatedSize(rect) {
        if (this._settings.calculateSize) {
            return this._settings.calculateSize(rect);
        }
        else {
            return {
                width: rect.width,
                height: rect.height,
            };
        }
    }
    _init() {
        const settings = this._settings;
        if (settings.accessible !== false) {
            if (settings.focusable) {
                this._inner.setAttribute("focusable", "true");
                this._inner.setAttribute("tabindex", this.tabindex + "");
            }
            if (settings.ariaLabel) {
                this._inner.setAttribute("aria-label", settings.ariaLabel);
            }
            if (settings.role) {
                this._inner.setAttribute("role", settings.role);
            }
        }
        const renderer = this._renderer;
        const rect = this._getRealSize();
        const size = this._getCalculatedSize(rect);
        const width = Math.floor(size.width);
        const height = Math.floor(size.height);
        const realWidth = Math.floor(rect.width);
        const realHeight = Math.floor(rect.height);
        const rootContainer = Container.new(this, {
            visible: true,
            width: width,
            height: height,
        });
        this._rootContainer = rootContainer;
        this._rootContainer._defaultThemes.push(DefaultTheme.new(this));
        const container = rootContainer.children.push(Container.new(this, { visible: true, width: p100, height: p100 }));
        this.container = container;
        renderer.resize(realWidth, realHeight, width, height);
        //@todo: better appendChild - refer
        this._inner.appendChild(renderer.view);
        // TODO: TMP TMP TMP for testing only, remove
        //renderer.debugGhostView = true;
        this._initResizeSensor();
        // HTML content holder
        const htmlElementContainer = document.createElement("div");
        this._htmlElementContainer = htmlElementContainer;
        htmlElementContainer.className = "am5-html-container";
        htmlElementContainer.style.position = "absolute";
        htmlElementContainer.style.pointerEvents = "none";
        if (!this._tooltipContainerSettings) {
            htmlElementContainer.style.overflow = "hidden";
        }
        this._inner.appendChild(htmlElementContainer);
        if (this._a11yD !== true) {
            // Create element which is used to make announcements to screen reader
            const readerAlertElement = document.createElement("div");
            readerAlertElement.className = "am5-reader-container";
            readerAlertElement.setAttribute("role", "alert");
            // readerAlertElement.style.zIndex = "-100000";
            // readerAlertElement.style.opacity = "0";
            // readerAlertElement.style.top = "0";
            readerAlertElement.style.position = "absolute";
            readerAlertElement.style.width = "1px";
            readerAlertElement.style.height = "1px";
            readerAlertElement.style.overflow = "hidden";
            readerAlertElement.style.clip = "rect(1px, 1px, 1px, 1px)";
            this._readerAlertElement = readerAlertElement;
            this._inner.appendChild(this._readerAlertElement);
            const focusElementContainer = document.createElement("div");
            focusElementContainer.className = "am5-focus-container";
            focusElementContainer.style.position = "absolute";
            focusElementContainer.style.pointerEvents = "none";
            focusElementContainer.style.top = "0px";
            focusElementContainer.style.left = "0px";
            focusElementContainer.style.overflow = "hidden";
            focusElementContainer.style.width = width + "px";
            focusElementContainer.style.height = height + "px";
            focusElementContainer.setAttribute("role", "graphics-document");
            setInteractive(focusElementContainer, false);
            this._focusElementContainer = focusElementContainer;
            this._inner.appendChild(this._focusElementContainer);
            const tooltipElementContainer = document.createElement("div");
            this._tooltipElementContainer = tooltipElementContainer;
            tooltipElementContainer.className = "am5-tooltip-container";
            this._inner.appendChild(tooltipElementContainer);
            // Add keyboard events for accessibility, e.g. simulating drag with arrow
            // keys and click with ENTER
            if (supports("keyboardevents")) {
                this._disposers.push(addEventListener(window, "keydown", (ev) => {
                    const eventKey = getEventKey(ev);
                    if (eventKey == "Shift") {
                        this._isShift = true;
                    }
                    else if (eventKey == "Tab") {
                        this._isShift = ev.shiftKey;
                    }
                }));
                this._disposers.push(addEventListener(window, "keyup", (ev) => {
                    const eventKey = getEventKey(ev);
                    if (eventKey == "Shift") {
                        this._isShift = false;
                    }
                }));
                this._disposers.push(addEventListener(focusElementContainer, "click", () => {
                    // Some screen readers convert ENTER (and some SPACE) press whil on
                    // focused element to a "click" event, preventing actual "keydown"
                    // event from firing. We're using this "click" event to still
                    // generate internal click events.
                    const focusedSprite = this._focusedSprite;
                    if (focusedSprite) {
                        const announceText = focusedSprite.get("clickAnnounceText", "");
                        if (announceText !== "") {
                            this.readerAlert(announceText);
                        }
                        const downEvent = renderer.getEvent(new MouseEvent("click"));
                        focusedSprite.events.dispatch("click", {
                            type: "click",
                            originalEvent: downEvent.event,
                            point: downEvent.point,
                            simulated: true,
                            target: focusedSprite
                        });
                    }
                }));
                this._disposers.push(addEventListener(focusElementContainer, "keydown", (ev) => {
                    const focusedSprite = this._focusedSprite;
                    if (focusedSprite) {
                        if (ev.key == "Escape") {
                            // ESC pressed - lose current focus
                            blur();
                            this._focusedSprite = undefined;
                        }
                        let dragOffsetX = 0;
                        let dragOffsetY = 0;
                        // TODO: figure out if using bogus MouseEvent is fine, or it will
                        // fail on some platforms
                        const eventKey = getEventKey(ev);
                        switch (eventKey) {
                            case "Enter":
                            case " ":
                                const announceText = focusedSprite.get("clickAnnounceText", "");
                                if (announceText !== "") {
                                    this.readerAlert(announceText);
                                }
                                if (eventKey == " " && focusedSprite.get("role") != "checkbox") {
                                    return;
                                }
                                ev.preventDefault();
                                const downEvent = renderer.getEvent(new MouseEvent("mouse"));
                                focusedSprite.events.dispatch("click", {
                                    type: "click",
                                    originalEvent: downEvent.event,
                                    point: downEvent.point,
                                    simulated: true,
                                    target: focusedSprite
                                });
                                return;
                            case "ArrowLeft":
                                dragOffsetX = -6;
                                break;
                            case "ArrowRight":
                                dragOffsetX = 6;
                                break;
                            case "ArrowUp":
                                dragOffsetY = -6;
                                break;
                            case "ArrowDown":
                                dragOffsetY = 6;
                                break;
                            default:
                                return;
                        }
                        if (dragOffsetX != 0 || dragOffsetY != 0) {
                            ev.preventDefault();
                            if (!focusedSprite.isDragging()) {
                                // Start dragging
                                this._keyboardDragPoint = {
                                    x: 0,
                                    y: 0
                                };
                                const downEvent = renderer.getEvent(new MouseEvent("mousedown", {
                                    clientX: 0,
                                    clientY: 0
                                }));
                                downEvent.point = {
                                    x: 0,
                                    y: 0
                                };
                                if (focusedSprite.events.isEnabled("pointerdown")) {
                                    focusedSprite.events.dispatch("pointerdown", {
                                        type: "pointerdown",
                                        originalEvent: downEvent.event,
                                        point: downEvent.point,
                                        simulated: true,
                                        target: focusedSprite
                                    });
                                }
                            }
                            // Move incrementally
                            const dragPoint = this._keyboardDragPoint;
                            dragPoint.x += dragOffsetX;
                            dragPoint.y += dragOffsetY;
                            const moveEvent = renderer.getEvent(new MouseEvent("mousemove", {
                                clientX: dragPoint.x,
                                clientY: dragPoint.y
                            }), false);
                            if (focusedSprite.events.isEnabled("globalpointermove")) {
                                focusedSprite.events.dispatch("globalpointermove", {
                                    type: "globalpointermove",
                                    originalEvent: moveEvent.event,
                                    point: moveEvent.point,
                                    simulated: true,
                                    target: focusedSprite
                                });
                            }
                        }
                    }
                }));
                this._disposers.push(addEventListener(focusElementContainer, "keyup", (ev) => {
                    if (this._focusedSprite) {
                        const focusedSprite = this._focusedSprite;
                        const eventKey = getEventKey(ev);
                        switch (eventKey) {
                            case "ArrowLeft":
                            case "ArrowRight":
                            case "ArrowUp":
                            case "ArrowDown":
                                if (focusedSprite.isDragging()) {
                                    // Simulate drag stop
                                    const dragPoint = this._keyboardDragPoint;
                                    const upEvent = renderer.getEvent(new MouseEvent("mouseup", {
                                        clientX: dragPoint.x,
                                        clientY: dragPoint.y
                                    }));
                                    if (focusedSprite.events.isEnabled("globalpointerup")) {
                                        focusedSprite.events.dispatch("globalpointerup", {
                                            type: "globalpointerup",
                                            originalEvent: upEvent.event,
                                            point: upEvent.point,
                                            simulated: true,
                                            target: focusedSprite
                                        });
                                    }
                                    //this._positionFocusElement(focusedSprite);
                                    this._keyboardDragPoint = undefined;
                                    // @todo dispatch mouseup event instead of calling dragStop?
                                    // this._dispatchEvent("globalpointerup", target, upEvent);
                                    return;
                                }
                                else if (focusedSprite.get("focusableGroup")) {
                                    // Find next item in focusable group
                                    const group = focusedSprite.get("focusableGroup");
                                    const items = this._tabindexes.filter((item) => {
                                        return item.get("focusableGroup") == group && item.getPrivate("focusable") !== false && item.isVisibleDeep() ? true : false;
                                    });
                                    let index = items.indexOf(focusedSprite);
                                    const lastIndex = items.length - 1;
                                    index += (eventKey == "ArrowRight" || eventKey == "ArrowDown") ? 1 : -1;
                                    if (index < 0) {
                                        index = lastIndex;
                                    }
                                    else if (index > lastIndex) {
                                        index = 0;
                                    }
                                    focus(items[index].getPrivate("focusElement").dom);
                                }
                                break;
                            case "Tab":
                                const group = focusedSprite.get("focusableGroup");
                                if (group && this._isShift) {
                                    if (!this._skipNextGroupJump) {
                                        this._focusNext(focusedSprite.getPrivate("focusElement").dom, -1, group);
                                        this._skipNextGroupJump = true;
                                    }
                                    return;
                                }
                                break;
                        }
                    }
                }));
            }
        }
        this._startTicker();
        this.setThemes([]);
        this._addTooltip();
        if (!this._hasLicense()) {
            this._showBranding();
        }
    }
    /**
     * Returns an instance of a universal [[Tooltip]] instance.
     * @since 5.14.0
     */
    get systemTooltip() {
        if (!this._systemTooltip) {
            const tooltip = Tooltip.new(this, {
                themeTags: ["system"]
            });
            this._systemTooltip = tooltip;
        }
        return this._systemTooltip;
    }
    _initResizeSensor() {
        if (this._resizeSensorDisposer) {
            this._resizeSensorDisposer.dispose();
        }
        this._resizeSensorDisposer = new ResizeSensor(this.dom, () => {
            if (this.autoResize) {
                this.resize();
            }
        });
        this._disposers.push(this._resizeSensorDisposer);
    }
    /**
     * If automatic resizing of char is disabled (`root.autoResize = false`), it
     * can be resized manually by calling this method.
     */
    resize() {
        const rect = this._getRealSize();
        const size = this._getCalculatedSize(rect);
        const w = Math.floor(size.width);
        const h = Math.floor(size.height);
        if (w > 0 && h > 0) {
            const realWidth = Math.floor(rect.width);
            const realHeight = Math.floor(rect.height);
            const htmlElementContainer = this._htmlElementContainer;
            htmlElementContainer.style.width = w + "px";
            htmlElementContainer.style.height = h + "px";
            if (this._a11yD !== true) {
                const focusElementContainer = this._focusElementContainer;
                focusElementContainer.style.width = w + "px";
                focusElementContainer.style.height = h + "px";
            }
            this._renderer.resize(realWidth, realHeight, w, h);
            const rootContainer = this._rootContainer;
            rootContainer.setPrivate("width", w);
            rootContainer.setPrivate("height", h);
            this._render();
            this._handleLogo();
        }
    }
    _render() {
        this._renderer.render(this._rootContainer._display);
        if (this._focusElementDirty) {
            this._updateCurrentFocus();
            this._focusElementDirty = false;
        }
    }
    _runTickers(currentTime) {
        each$1(this._tickers, (f) => {
            f(currentTime);
        });
    }
    _runAnimations(currentTime) {
        let running = 0;
        keepIf(this._animations, (animation) => {
            const state = animation._runAnimation(currentTime);
            if (state === AnimationState.Stopped) {
                return false;
            }
            else if (state === AnimationState.Playing) {
                ++running;
                return true;
            }
            else {
                return true;
            }
        });
        this._isDirtyAnimation = false;
        return running === 0;
    }
    _runDirties() {
        //console.log("tick **************************************************************");		
        let allParents = {};
        while (this._isDirtyParents) {
            // This must be before calling _prepareChildren
            this._isDirtyParents = false;
            keys(this._dirtyParents).forEach((key) => {
                const parent = this._dirtyParents[key];
                delete this._dirtyParents[key];
                if (!parent.isDisposed()) {
                    allParents[parent.uid] = parent;
                    parent._prepareChildren();
                }
            });
        }
        keys(allParents).forEach((key) => {
            allParents[key]._updateChildren();
        });
        const objects = [];
        //		console.log("_beforeChanged")
        keys(this._dirty).forEach((key) => {
            const entity = this._dirty[key];
            if (entity.isDisposed()) {
                delete this._dirty[entity.uid];
            }
            else {
                objects.push(entity);
                entity._beforeChanged();
            }
        });
        //		console.log("_changed")
        objects.forEach((entity) => {
            entity._changed();
            delete this._dirty[entity.uid];
            entity._clearDirty();
        });
        this._isDirty = false;
        const depths = {};
        const bounds = [];
        keys(this._dirtyBounds).forEach((key) => {
            const entity = this._dirtyBounds[key];
            delete this._dirtyBounds[key];
            if (!entity.isDisposed()) {
                depths[entity.uid] = entity.depth();
                bounds.push(entity);
            }
        });
        this._positionHTMLElements();
        // High depth -> low depth
        bounds.sort((x, y) => {
            return compare(depths[y.uid], depths[x.uid]);
        });
        //		console.log("_updateBounds")
        bounds.forEach((entity) => {
            entity._updateBounds();
        });
        //		console.log("_updatePosition")
        const dirtyPositions = this._dirtyPositions;
        keys(dirtyPositions).forEach((key) => {
            const sprite = dirtyPositions[key];
            delete dirtyPositions[key];
            if (!sprite.isDisposed()) {
                sprite._updatePosition();
            }
        });
        //		console.log("_afterChanged")
        objects.forEach((entity) => {
            entity._afterChanged();
        });
        keys(allParents).forEach((key) => {
            allParents[key]._childrenPrep = false;
            allParents[key]._childrenUpdt = false;
        });
    }
    _renderFrame(currentTime) {
        if (this._updateTick) {
            if (this.events.isEnabled("framestarted")) {
                this.events.dispatch("framestarted", {
                    type: "framestarted",
                    target: this,
                    timestamp: currentTime,
                });
            }
            this._checkComputedStyles();
            this._runTickers(currentTime);
            const animationDone = this._runAnimations(currentTime);
            this._runDirties();
            this._render();
            this._renderer.resetImageArray();
            this._positionHTMLElements();
            if (this.events.isEnabled("frameended")) {
                this.events.dispatch("frameended", {
                    type: "frameended",
                    target: this,
                    timestamp: currentTime,
                });
            }
            return this._tickers.length === 0 &&
                animationDone &&
                !this._isDirtyAnimation &&
                !this._isDirty;
        }
        else {
            return true;
        }
    }
    _runTicker(currentTime, now) {
        if (!this.isDisposed()) {
            this.animationTime = currentTime;
            const done = this._renderFrame(currentTime);
            // No more work to do
            if (done) {
                this._ticker = null;
                this.animationTime = null;
            }
            else {
                if (!this._paused) {
                    if (now) {
                        this._ticker;
                    }
                    else {
                        rAF(this.fps, this._ticker);
                    }
                }
            }
        }
    }
    _runTickerNow(timeout = 10000) {
        if (!this.isDisposed()) {
            const endTime = performance.now() + timeout;
            for (;;) {
                const currentTime = performance.now();
                if (currentTime >= endTime) {
                    this.animationTime = null;
                    break;
                }
                this.animationTime = currentTime;
                const done = this._renderFrame(currentTime);
                if (done) {
                    this.animationTime = null;
                    break;
                }
            }
        }
    }
    _startTicker() {
        if (this._ticker === null) {
            this.animationTime = null;
            this._ticker = (currentTime) => {
                this._runTicker(currentTime);
            };
            rAF(this.fps, this._ticker);
        }
    }
    /**
     * Returns whether the root is updating or not.
     */
    get updateTick() {
        return this._updateTick;
    }
    /**
     * Enables or disables the root updating.
     */
    set updateTick(value) {
        this._updateTick = value;
        if (value) {
            this._startTicker();
        }
    }
    _addDirtyEntity(entity) {
        this._isDirty = true;
        if (this._dirty[entity.uid] === undefined) {
            this._dirty[entity.uid] = entity;
        }
        this._startTicker();
    }
    _addDirtyParent(parent) {
        this._isDirty = true;
        this._isDirtyParents = true;
        if (this._dirtyParents[parent.uid] === undefined) {
            this._dirtyParents[parent.uid] = parent;
        }
        this._startTicker();
    }
    _addDirtyBounds(entity) {
        this._isDirty = true;
        if (this._dirtyBounds[entity.uid] === undefined) {
            this._dirtyBounds[entity.uid] = entity;
        }
        this._startTicker();
    }
    _addDirtyPosition(sprite) {
        this._isDirty = true;
        if (this._dirtyPositions[sprite.uid] === undefined) {
            this._dirtyPositions[sprite.uid] = sprite;
        }
        this._startTicker();
    }
    _addAnimation(animation) {
        this._isDirtyAnimation = true;
        // TODO use numeric id instead
        if (this._animations.indexOf(animation) === -1) {
            this._animations.push(animation);
        }
        this._startTicker();
    }
    _markDirty() {
        this._isDirty = true;
    }
    _markDirtyRedraw() {
        this.events.once("frameended", () => {
            this._isDirty = true;
            this._startTicker();
        });
    }
    eachFrame(f) {
        this._tickers.push(f);
        this._startTicker();
        return new Disposer(() => {
            removeFirst(this._tickers, f);
        });
    }
    markDirtyGlobal(container) {
        if (!container) {
            container = this.container;
        }
        container.walkChildren((child) => {
            if (child instanceof Container) {
                this.markDirtyGlobal(child);
            }
            child.markDirty();
            child.markDirtyBounds();
        });
    }
    /**
     * Returns width of the target container, in pixels.
     *
     * @return Width
     */
    width() {
        // TODO make this more efficient, maybe just return the renderer's width ?
        return Math.floor(this._getCalculatedSize(this._getRealSize()).width);
    }
    /**
     * Returns height of the target container, in pixels.
     *
     * @return Height
     */
    height() {
        // TODO make this more efficient, maybe just return the renderer's height ?
        return Math.floor(this._getCalculatedSize(this._getRealSize()).height);
    }
    /**
     * Disposes root and all the content in it.
     */
    dispose() {
        if (!this._isDisposed) {
            this._isDisposed = true;
            this._rootContainer.dispose();
            this._renderer.dispose();
            this.horizontalLayout.dispose();
            this.verticalLayout.dispose();
            this.interfaceColors.dispose();
            each$1(this._disposers, (x) => {
                x.dispose();
            });
            if (this._inner) {
                removeElement(this._inner);
            }
            remove(registry.rootElements, this);
        }
    }
    /**
     * Returns `true` if root element is disposed.
     *
     * @return Disposed?
     */
    isDisposed() {
        return this._isDisposed;
    }
    /**
     * Triggers screen reader read out a message.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/accessibility/} for more info
     * @param  text  Alert text
     */
    readerAlert(text) {
        if (this._a11yD !== true) {
            const element = this._readerAlertElement;
            text = stripTags(text);
            if (element.innerHTML == text) {
                element.innerHTML = "";
            }
            element.innerHTML = text;
        }
    }
    /**
     * Sets themes to be used for the chart.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/themes/} for more info
     * @param  themes  A list of themes
     */
    setThemes(themes) {
        this._rootContainer.set("themes", themes);
        // otherwise new themes are not applied
        const tooltipContainer = this.tooltipContainer;
        if (tooltipContainer) {
            tooltipContainer._applyThemes();
        }
        // @todo review this
        const interfaceColors = this.interfaceColors;
        if (interfaceColors) {
            interfaceColors._applyThemes();
        }
    }
    _addTooltip() {
        if (!this.tooltipContainer) {
            const tooltipContainerSettings = this._tooltipContainerSettings;
            const tooltipContainer = this._rootContainer.children.push(Container.new(this, {
                position: "absolute",
                isMeasured: false,
                width: p100,
                height: p100,
                layer: tooltipContainerSettings ? 35 : 30,
                layerMargin: tooltipContainerSettings ? tooltipContainerSettings : undefined
            }));
            this.tooltipContainer = tooltipContainer;
            const tooltip = Tooltip.new(this, {});
            this.container.set("tooltip", tooltip);
            tooltip.hide(0);
            this._tooltip = tooltip;
        }
    }
    /**
     * Accesibility
     */
    _registerTabindexOrder(target) {
        if (this._a11yD == true) {
            return;
        }
        if (target.get("focusable")) {
            pushOne(this._tabindexes, target);
        }
        else {
            remove(this._tabindexes, target);
        }
        this._invalidateTabindexes();
    }
    _unregisterTabindexOrder(target) {
        if (this._a11yD == true) {
            return;
        }
        remove(this._tabindexes, target);
        this._invalidateTabindexes();
    }
    _invalidateTabindexes() {
        if (this._a11yD == true) {
            return;
        }
        this._tabindexes.sort((a, b) => {
            const aindex = a.get("tabindexOrder", 0);
            const bindex = b.get("tabindexOrder", 0);
            if (aindex == bindex) {
                return 0;
            }
            else if (aindex > bindex) {
                return 1;
            }
            else {
                return -1;
            }
        });
        const groups = [];
        each$1(this._tabindexes, (item, index) => {
            if (!item.getPrivate("focusElement")) {
                this._makeFocusElement(index, item);
            }
            else {
                this._moveFocusElement(index, item);
            }
            const group = item.get("focusableGroup");
            if (group && item.getPrivate("focusable") !== false) {
                if (groups.indexOf(group) !== -1) {
                    // Non-first element in the group, make it not directly focusable
                    item.getPrivate("focusElement").dom.setAttribute("tabindex", "-1");
                }
                else {
                    groups.push(group);
                }
            }
        });
    }
    _updateCurrentFocus() {
        if (this._a11yD == true) {
            return;
        }
        if (this._focusedSprite) {
            this._decorateFocusElement(this._focusedSprite);
            this._positionFocusElement(this._focusedSprite);
        }
    }
    _decorateFocusElement(target, focusElement) {
        if (this._a11yD == true) {
            return;
        }
        // Decorate with proper accessibility attributes
        if (!focusElement) {
            focusElement = target.getPrivate("focusElement").dom;
        }
        if (!focusElement) {
            return;
        }
        const role = target.get("role");
        if (role) {
            focusElement.setAttribute("role", role);
        }
        else {
            focusElement.removeAttribute("role");
        }
        const ariaLabel = target.get("ariaLabel");
        if (ariaLabel) {
            const label = populateString(target, ariaLabel);
            focusElement.setAttribute("aria-label", label);
        }
        else {
            focusElement.removeAttribute("aria-label");
        }
        const ariaLive = target.get("ariaLive");
        if (ariaLive) {
            focusElement.setAttribute("aria-live", ariaLive);
        }
        else {
            focusElement.removeAttribute("aria-live");
        }
        const ariaChecked = target.get("ariaChecked");
        if (ariaChecked != null && role && ["checkbox", "option", "radio", "menuitemcheckbox", "menuitemradio", "treeitem"].indexOf(role) !== -1) {
            focusElement.setAttribute("aria-checked", ariaChecked ? "true" : "false");
        }
        else {
            focusElement.removeAttribute("aria-checked");
        }
        const ariaCurrent = target.get("ariaCurrent");
        if (ariaCurrent != null) {
            focusElement.setAttribute("aria-current", ariaCurrent);
        }
        else {
            focusElement.removeAttribute("aria-current");
        }
        const ariaSelected = target.get("ariaSelected");
        if (ariaSelected != null && role && ["gridcell", "option", "row", "tab", "columnheader", "rowheader", "treeitem"].indexOf(role) !== -1) {
            focusElement.setAttribute("aria-selected", ariaSelected ? "true" : "false");
        }
        else {
            focusElement.removeAttribute("aria-selected");
        }
        if (target.get("ariaHidden")) {
            focusElement.setAttribute("aria-hidden", "true");
        }
        else {
            focusElement.removeAttribute("aria-hidden");
        }
        const ariaOrientation = target.get("ariaOrientation");
        if (ariaOrientation) {
            focusElement.setAttribute("aria-orientation", ariaOrientation);
        }
        else {
            focusElement.removeAttribute("aria-orientation");
        }
        const ariaValueNow = target.get("ariaValueNow");
        if (ariaValueNow) {
            focusElement.setAttribute("aria-valuenow", ariaValueNow);
        }
        else {
            focusElement.removeAttribute("aria-valuenow");
        }
        const ariaValueMin = target.get("ariaValueMin");
        if (ariaValueMin) {
            focusElement.setAttribute("aria-valuemin", ariaValueMin);
        }
        else {
            focusElement.removeAttribute("aria-valuemin");
        }
        const ariaValueMax = target.get("ariaValueMax");
        if (ariaValueMax) {
            focusElement.setAttribute("aria-valuemax", ariaValueMax);
        }
        else {
            focusElement.removeAttribute("aria-valuemax");
        }
        const ariaValueText = target.get("ariaValueText");
        if (ariaValueText) {
            focusElement.setAttribute("aria-valuetext", ariaValueText);
        }
        else {
            focusElement.removeAttribute("aria-valuetext");
        }
        const ariaControls = target.get("ariaControls");
        if (ariaControls) {
            focusElement.setAttribute("aria-controls", ariaControls);
        }
        else {
            focusElement.removeAttribute("aria-controls");
        }
        if (target.get("visible") && target.get("opacity") !== 0 && target.get("role") != "tooltip" && !target.isHidden() && target.getPrivate("focusable") !== false && (target.height() || target.width())) {
            if (focusElement.getAttribute("tabindex") != "-1") {
                focusElement.setAttribute("tabindex", "" + this.tabindex);
            }
            focusElement.removeAttribute("aria-hidden");
        }
        else {
            focusElement.removeAttribute("tabindex");
            focusElement.setAttribute("aria-hidden", "true");
        }
    }
    _makeFocusElement(index, target) {
        if (target.getPrivate("focusElement") || this._a11yD == true) {
            return;
        }
        // Init
        const focusElement = document.createElement("div");
        if (target.get("role") != "tooltip") {
            focusElement.tabIndex = this.tabindex;
        }
        focusElement.style.position = "absolute";
        setInteractive(focusElement, false);
        const disposers = [];
        target.setPrivate("focusElement", {
            dom: focusElement,
            disposers,
        });
        this._decorateFocusElement(target);
        disposers.push(addEventListener(focusElement, "focus", (ev) => {
            this._handleFocus(ev);
        }));
        disposers.push(addEventListener(focusElement, "blur", (ev) => {
            this._handleBlur(ev);
        }));
        this._moveFocusElement(index, target);
    }
    _removeFocusElement(target) {
        if (this._a11yD == true) {
            return;
        }
        remove(this._tabindexes, target);
        const focusElement = target.getPrivate("focusElement");
        if (focusElement) {
            const container = this._focusElementContainer;
            container.removeChild(focusElement.dom);
            each$1(focusElement.disposers, (x) => {
                x.dispose();
            });
        }
    }
    _hideFocusElement(target) {
        if (this._a11yD == true) {
            return;
        }
        const focusElement = target.getPrivate("focusElement");
        focusElement.dom.style.display = "none";
    }
    _moveFocusElement(index, target) {
        if (this._a11yD == true) {
            return;
        }
        // Get container
        const container = this._focusElementContainer;
        const focusElement = target.getPrivate("focusElement").dom;
        if (focusElement === this._focusElementContainer.children[index]) {
            // Nothing to do
            return;
        }
        const next = this._focusElementContainer.children[index + 1];
        if (next) {
            container.insertBefore(focusElement, next);
        }
        else {
            container.append(focusElement);
        }
    }
    _positionFocusElement(target) {
        if (this._a11yD == true || target == undefined) {
            return;
        }
        const bounds = target.globalBounds();
        let width = bounds.right == bounds.left ? target.width() : bounds.right - bounds.left;
        let height = bounds.top == bounds.bottom ? target.height() : bounds.bottom - bounds.top;
        const padding = this._settings.focusPadding !== undefined ? this._settings.focusPadding : 2;
        let x = bounds.left - padding;
        let y = bounds.top - padding;
        if (width < 0) {
            x += width;
            width = Math.abs(width);
        }
        if (height < 0) {
            y += height;
            height = Math.abs(height);
        }
        const focusElement = target.getPrivate("focusElement").dom;
        focusElement.style.top = y + "px";
        focusElement.style.left = x + "px";
        focusElement.style.width = (width + padding * 2) + "px";
        focusElement.style.height = (height + padding * 2) + "px";
    }
    _getSpriteByFocusElement(target) {
        let found;
        eachContinue$1(this._tabindexes, (item, _index) => {
            if (item.getPrivate("focusElement").dom === target) {
                found = item;
                return false;
            }
            return true;
        });
        return found;
    }
    _handleFocus(ev) {
        if (this._a11yD == true) {
            return;
        }
        // Get element
        //const focused = this._tabindexes[index];
        const focused = this._getSpriteByFocusElement(ev.target);
        if (!focused) {
            return;
        }
        // Jump over hidden elements
        if (!focused.isVisibleDeep()) {
            this._focusNext(ev.target, this._isShift ? -1 : 1);
            return;
        }
        // Size and position
        this._positionFocusElement(focused);
        //this._decorateFocusElement(focused);
        this._focusedSprite = focused;
        if (focused.events.isEnabled("focus")) {
            focused.events.dispatch("focus", {
                type: "focus",
                originalEvent: ev,
                target: focused
            });
        }
        if (focused.getPrivate("focusElement").dom.tabIndex == -1) {
            this._skipNextGroupJump = false;
        }
    }
    _focusNext(el, direction, group) {
        if (this._a11yD == true) {
            return;
        }
        const focusableElements = Array.from(document.querySelectorAll([
            'a[href]',
            'area[href]',
            'button:not([disabled])',
            'details',
            'input:not([disabled])',
            'iframe:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[contentEditable=""]',
            '[contentEditable="true"]',
            '[contentEditable="TRUE"]',
            '[tabindex]:not([tabindex^="-"])',
            //':not([disabled])'
        ].join(',')));
        let index = focusableElements.indexOf(el) + direction;
        if (index < 0) {
            index = focusableElements.length - 1;
        }
        else if (index >= focusableElements.length) {
            index = 0;
        }
        const targetElement = focusableElements[index];
        if (group && direction == -1) {
            const target = this._getSpriteByFocusElement(targetElement);
            if (target && target.get("focusableGroup") == group) {
                this._focusNext(targetElement, direction);
                return;
            }
        }
        targetElement.focus();
    }
    _handleBlur(ev) {
        if (this._a11yD == true) {
            return;
        }
        const focused = this._focusedSprite;
        if (focused && !focused.isDisposed() && focused.events.isEnabled("blur")) {
            focused.events.dispatch("blur", {
                type: "blur",
                originalEvent: ev,
                target: focused
            });
        }
        this._focusedSprite = undefined;
    }
    /**
     * @ignore
     */
    updateTooltip(target) {
        if (this._a11yD == true) {
            return;
        }
        const text = stripTags(target._getText());
        let tooltipElement = target.getPrivate("tooltipElement");
        if (target.get("role") == "tooltip" && text != "") {
            if (!tooltipElement) {
                tooltipElement = this._makeTooltipElement(target);
            }
            if (tooltipElement.innerHTML != text) {
                tooltipElement.innerHTML = text;
            }
            tooltipElement.setAttribute("aria-hidden", target.isVisibleDeep() ? "false" : "true");
        }
        else if (tooltipElement) {
            tooltipElement.remove();
            target.removePrivate("tooltipElement");
        }
    }
    _makeTooltipElement(target) {
        const container = this._tooltipElementContainer;
        const tooltipElement = document.createElement("div");
        tooltipElement.style.position = "absolute";
        tooltipElement.style.width = "1px";
        tooltipElement.style.height = "1px";
        tooltipElement.style.overflow = "hidden";
        tooltipElement.style.clip = "rect(1px, 1px, 1px, 1px)";
        setInteractive(tooltipElement, false);
        this._decorateFocusElement(target, tooltipElement);
        container.append(tooltipElement);
        target.setPrivate("tooltipElement", tooltipElement);
        return tooltipElement;
    }
    _removeTooltipElement(target) {
        if (this._a11yD == true) {
            return;
        }
        const tooltipElement = target.getPrivate("tooltipElement");
        if (tooltipElement) {
            const parent = tooltipElement.parentElement;
            if (parent) {
                parent.removeChild(tooltipElement);
            }
        }
    }
    _invalidateAccessibility(target) {
        if (this._a11yD == true) {
            return;
        }
        this._focusElementDirty = true;
        const focusElement = target.getPrivate("focusElement");
        if (target.get("focusable")) {
            if (focusElement) {
                this._decorateFocusElement(target);
                this._positionFocusElement(target);
            }
            // else {
            // 	this._renderer._makeFocusElement(0, this);
            // }
        }
        else if (focusElement) {
            this._removeFocusElement(target);
        }
        //this.updateCurrentFocus();
    }
    /**
     * Returns `true` if `target` is currently focused.
     *
     * @param   target  Target
     * @return          Focused?
     */
    focused(target) {
        return this._focusedSprite === target;
    }
    /**
     * Converts document coordinates to coordinates withing root element.
     *
     * @param   point  Document point
     * @return         Root point
     */
    documentPointToRoot(point) {
        const rect = this._getRealSize();
        const size = this._getCalculatedSize(rect);
        const scaleWidth = size.width / rect.width;
        const scaleHeight = size.height / rect.height;
        return {
            x: (point.x - rect.left) * scaleWidth,
            y: (point.y - rect.top) * scaleHeight,
        };
    }
    /**
     * Converts root coordinates to document
     *
     * @param   point  Document point
     * @return         Root point
     */
    rootPointToDocument(point) {
        const rect = this._getRealSize();
        const size = this._getCalculatedSize(rect);
        const scaleWidth = size.width / rect.width;
        const scaleHeight = size.height / rect.height;
        return {
            x: (point.x / scaleWidth) + rect.left,
            y: (point.y / scaleHeight) + rect.top
        };
    }
    /**
     * @ignore
     */
    addDisposer(disposer) {
        this._disposers.push(disposer);
        return disposer;
    }
    _updateComputedStyles() {
        const styles = window.getComputedStyle(this.dom);
        let fontHash = "";
        each(styles, (key, val) => {
            if (isString(key) && key.match(/^font/)) {
                fontHash += val;
            }
        });
        const changed = fontHash != this._fontHash;
        if (changed) {
            this._fontHash = fontHash;
        }
        return changed;
    }
    _checkComputedStyles() {
        if (this._updateComputedStyles()) {
            this._invalidateLabelBounds(this.container);
        }
    }
    _invalidateLabelBounds(target) {
        if (target instanceof Container) {
            target.children.each((child) => {
                this._invalidateLabelBounds(child);
            });
        }
        else if (target instanceof Text) {
            target.markDirtyBounds();
        }
    }
    /**
     * To all the clever heads out there. Yes, we did not make any attempts to
     * scramble this.
     *
     * This is a part of a tool meant for our users to manage their commercial
     * licenses for removal of amCharts branding from charts.
     *
     * The only legit way to do so is to purchase a commercial license for amCharts:
     * https://www.amcharts.com/online-store/
     *
     * Removing or altering this code, or disabling amCharts branding in any other
     * way is against the license and thus illegal.
     */
    _hasLicense() {
        for (let i = 0; i < registry.licenses.length; i++) {
            if (registry.licenses[i].match(/^AM5C.{5,}/i)) {
                return true;
            }
        }
        return false;
    }
    _licenseApplied() {
        if (this._logo) {
            this._logo.set("forceHidden", true);
        }
    }
    /**
     * @ignore
     */
    get debugGhostView() {
        return this._renderer.debugGhostView;
    }
    /**
     * @ignore
     */
    set debugGhostView(value) {
        this._renderer.debugGhostView = value;
    }
    /**
     * Set this to `true` if you need chart to require first a tap onto it before
     * touch gesture related functionality like zoom/pan is turned on.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/root-element/#Touch_related_options} for more info
     * @default false
     * @since 5.2.9
     * @param  value  Needs a tap to activate touch functions
     */
    set tapToActivate(value) {
        this._renderer.tapToActivate = value;
    }
    /**
     * @return Needs a tap to activate touch functions
     */
    get tapToActivate() {
        return this._renderer.tapToActivate;
    }
    /**
     * If `tapToActivate` is set to `true`, this setting will determine number
     * of milliseconds the chart will stay "active", before releasing the
     * controls back to the page.
     *
     * @see {@link https://www.amcharts.com/docs/v5/getting-started/root-element/#Touch_related_options} for more info
     * @default 3000
     * @since 5.2.9
     * @param  value  Timeout
     */
    set tapToActivateTimeout(value) {
        this._renderer.tapToActivateTimeout = value;
    }
    /**
     * @return Timeout
     */
    get tapToActivateTimeout() {
        return this._renderer.tapToActivateTimeout;
    }
    _makeHTMLElement(target) {
        // Get container
        const container = this._htmlElementContainer;
        // Init
        const htmlElement = document.createElement("div");
        target.setPrivate("htmlElement", htmlElement);
        // Should we put this into a wrapper?
        let needWrapper = false;
        let wrapperTarget;
        target._walkParents((parent) => {
            if (parent.get("verticalScrollbar")) {
                needWrapper = true;
                wrapperTarget = parent;
                return false;
            }
        });
        let htmlElementWrapper;
        if (needWrapper) {
            htmlElementWrapper = document.createElement("div");
            target.setPrivate("htmlElementWrapper", htmlElementWrapper);
            target.setPrivate("wrapperContainer", wrapperTarget);
            htmlElementWrapper.style.position = "absolute";
            htmlElementWrapper.style.overflow = "hidden";
            htmlElementWrapper.style.boxSizing = "border-box";
            htmlElementWrapper.style.top = "0px";
            htmlElementWrapper.style.left = "0px";
            htmlElementWrapper.style.width = "100%";
            htmlElementWrapper.style.height = "100%";
            wrapperTarget.events.on("boundschanged", () => {
                this._positionHTMLElement(target);
            });
        }
        //htmlElement.tabIndex = this.tabindex;
        htmlElement.style.position = "absolute";
        htmlElement.style.overflow = "auto";
        htmlElement.style.boxSizing = "border-box";
        setInteractive(htmlElement, target.get("interactive", false));
        // Translate events
        if (target.events.isEnabled("click")) {
            setInteractive(htmlElement, true);
            this._disposers.push(addEventListener(htmlElement, "click", (ev) => {
                const downEvent = this._renderer.getEvent(ev);
                target.events.dispatch("click", {
                    type: "click",
                    originalEvent: downEvent.event,
                    point: downEvent.point,
                    simulated: false,
                    target: target
                });
            }));
        }
        this._positionHTMLElement(target);
        if (needWrapper) {
            htmlElementWrapper.append(htmlElement);
            container.append(htmlElementWrapper);
        }
        else {
            container.append(htmlElement);
        }
        pushOne(this._htmlEnabledContainers, target);
        return htmlElement;
    }
    _positionHTMLElements() {
        each$1(this._htmlEnabledContainers, (target) => {
            this._positionHTMLElement(target);
        });
    }
    _positionHTMLElement(target) {
        const htmlElementWrapper = target.getPrivate("htmlElementWrapper");
        if (htmlElementWrapper) {
            const wrapperTarget = target.getPrivate("wrapperContainer");
            if (wrapperTarget) {
                const bounds = wrapperTarget.globalBounds();
                htmlElementWrapper.style.clipPath = "rect(" + bounds.top + "px " + bounds.right + "px " + bounds.bottom + "px " + bounds.left + "px)";
            }
        }
        const htmlElement = target.getPrivate("htmlElement");
        if (htmlElement) {
            // Translate settings
            const visualSettings = [
                "paddingTop",
                "paddingRight",
                "paddingBottom",
                "paddingLeft",
                "minWidth",
                "minHeight",
                "maxWidth",
                "maxHeight"
            ];
            each$1(visualSettings, (setting) => {
                const value = target.get(setting);
                if (value) {
                    htmlElement.style[setting] = value + "px";
                }
                else {
                    htmlElement.style[setting] = "";
                }
            });
            const strtingSettings = [
                "fontFamily",
                "fontSize",
                "fontStyle",
                "fontWeight",
                "fontStyle",
                "fontVariant",
                "textDecoration"
            ];
            each$1(strtingSettings, (setting) => {
                const value = target.get(setting);
                if (value) {
                    if (setting == "fontSize" && !isString(value)) {
                        htmlElement.style[setting] = value + "px";
                    }
                    else {
                        htmlElement.style[setting] = value + "";
                    }
                }
                else {
                    htmlElement.style[setting] = "";
                }
            });
            // Init and reset scale / rotation
            const scale = target.compositeScale() || 1;
            const rotation = target.compositeRotation() || 0;
            htmlElement.style.transform = "";
            htmlElement.style.transformOrigin = "";
            // Deal with opacity
            const opacity = target.compositeOpacity();
            setTimeout(() => {
                htmlElement.style.opacity = opacity + "";
            }, 10);
            const visible = target.isVisibleDeep();
            if (visible) {
                htmlElement.style.display = "block";
            }
            // Deal with position
            // const bounds = target.globalBounds();
            // htmlElement.style.top = (bounds.top) + "px";
            // htmlElement.style.left = (bounds.left) + "px";
            let pos = {
                x: target.x() + target.get("dx", 0),
                y: target.y() + target.get("dy", 0)
            };
            if (target.parent) {
                pos = target.parent.toGlobal(pos);
            }
            htmlElement.style.top = pos.y + "px";
            htmlElement.style.left = pos.x + "px";
            // Use width/height if those are set
            const width = target.get("width");
            const height = target.get("height");
            let w = 0;
            let h = 0;
            if (width) {
                w = target.width();
            }
            if (height) {
                h = target.height();
            }
            if (!width || !height) {
                htmlElement.style.position = "fixed";
                htmlElement.style.width = "";
                htmlElement.style.height = "";
                const bbox = htmlElement.getBoundingClientRect();
                htmlElement.style.position = "absolute";
                if (!width)
                    w = bbox.width;
                if (!height)
                    h = bbox.height;
                let lw = w / scale;
                let lh = h / scale;
                let cx = target.get("centerX", 0);
                let cy = target.get("centerY", 0);
                let ll = 0;
                let lr = 0;
                let lt = 0;
                let lb = 0;
                if (cx instanceof Percent) {
                    ll = -cx.value * lw;
                    lr = (1 - cx.value) * lw;
                }
                else {
                    ll = -cx;
                    lr = lw - cx;
                }
                if (cy instanceof Percent) {
                    lt = -cy.value * lh;
                    lb = (1 - cy.value) * lh;
                }
                else {
                    lt = -cy;
                    lb = lh - cy;
                }
                target._localBounds = { left: ll, right: lr, top: lt, bottom: lb };
                let previousBounds = target._adjustedLocalBounds;
                let newBounds = target._display.getAdjustedBounds(target._localBounds);
                target._adjustedLocalBounds = newBounds;
                // compare each value of the bounds
                if (previousBounds.left !== newBounds.left || previousBounds.right !== newBounds.right || previousBounds.top !== newBounds.top || previousBounds.bottom !== newBounds.bottom) {
                    target.markDirtyBounds();
                }
            }
            if (w > 0) {
                htmlElement.style.minWidth = (w) + "px";
            }
            if (h > 0) {
                htmlElement.style.minHeight = (h) + "px";
            }
            // Hide or show
            if (!visible || opacity == 0) {
                htmlElement.style.display = "none";
            }
            // Center position
            const x = target.get("centerX", 0);
            const originX = isPercent(x) ? x.percent + "%" : x + "px";
            const y = target.get("centerY", 0);
            const originY = isPercent(y) ? y.percent + "%" : y + "px";
            if (x || y) {
                htmlElement.style.transform = "translate(-" + originX + ", -" + originY + ")" + htmlElement.style.transform;
            }
            // Deal with scale
            if (scale != 1) {
                htmlElement.style.transform += "scale(" + scale + ")";
            }
            if (rotation != 0) {
                htmlElement.style.transform += " rotate(" + rotation + "deg)";
            }
            if (htmlElement.style.transform != "") {
                htmlElement.style.transformOrigin = originX + " " + originY;
                //htmlElement.style.transformOrigin = "0% 0%";
            }
        }
    }
    _setHTMLContent(target, html) {
        let htmlElement = target.getPrivate("htmlElement");
        if (!htmlElement) {
            htmlElement = this._makeHTMLElement(target);
            if (!this.autoResize) {
                this.resize();
            }
        }
        if (htmlElement.innerHTML != html) {
            htmlElement.innerHTML = html;
        }
    }
    _removeHTMLContent(target) {
        const htmlElementWrapper = target.getPrivate("htmlElementWrapper");
        const htmlElement = target.getPrivate("htmlElement");
        if (htmlElementWrapper) {
            this._htmlElementContainer.removeChild(htmlElementWrapper);
            target.removePrivate("htmlElement");
            target.removePrivate("htmlElementWrapper");
            target.removePrivate("wrapperContainer");
        }
        else if (htmlElement) {
            this._htmlElementContainer.removeChild(htmlElement);
            target.removePrivate("htmlElement");
            target.removePrivate("wrapperContainer");
        }
        remove(this._htmlEnabledContainers, target);
    }
}

/**
 * Draws a rectangle with rounded corners.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 * @important
 */
class RoundedRectangle extends Rectangle {
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("cornerRadiusTL") || this.isDirty("cornerRadiusTR") || this.isDirty("cornerRadiusBR") || this.isDirty("cornerRadiusBL")) {
            this._clear = true;
        }
    }
    _draw() {
        let width = this.width();
        let height = this.height();
        let wSign = width / Math.abs(width);
        let hSign = height / Math.abs(height);
        let x = 0;
        let y = 0;
        const strokeWidth = this.get("strokeWidth", 0);
        if (this.get("containStroke", false)) {
            width -= wSign * strokeWidth;
            height -= hSign * strokeWidth;
            x += wSign * strokeWidth / 2;
            y += hSign * strokeWidth / 2;
        }
        let w = width;
        let h = height;
        if (isNumber(w) && isNumber(h)) {
            let minSide = Math.min(w, h) / 2;
            let crtl = relativeToValue(this.get("cornerRadiusTL", 8), minSide);
            let crtr = relativeToValue(this.get("cornerRadiusTR", 8), minSide);
            let crbr = relativeToValue(this.get("cornerRadiusBR", 8), minSide);
            let crbl = relativeToValue(this.get("cornerRadiusBL", 8), minSide);
            let maxcr = Math.min(Math.abs(w / 2), Math.abs(h / 2));
            crtl = fitToRange(crtl, 0, maxcr);
            crtr = fitToRange(crtr, 0, maxcr);
            crbr = fitToRange(crbr, 0, maxcr);
            crbl = fitToRange(crbl, 0, maxcr);
            const display = this._display;
            display.moveTo(x + crtl * wSign, y);
            display.lineTo(x + w - crtr * wSign, y);
            if (crtr > 0) {
                display.arcTo(x + w, y, x + w, y + crtr * hSign, crtr);
            }
            display.lineTo(x + w, y + h - crbr * hSign);
            if (crbr > 0) {
                display.arcTo(x + w, y + h, x + w - crbr * wSign, y + h, crbr);
            }
            display.lineTo(x + crbl * wSign, y + h);
            if (crbl > 0) {
                display.arcTo(x, y + h, x, y + h - crbl * hSign, crbl);
            }
            display.lineTo(x, y + crtl * hSign);
            if (crtl > 0) {
                display.arcTo(x, y, x + crtl * wSign, y, crtl);
            }
            display.closePath();
        }
    }
}
Object.defineProperty(RoundedRectangle, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "RoundedRectangle"
});
Object.defineProperty(RoundedRectangle, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Rectangle.classNames.concat([RoundedRectangle.className])
});

/**
 * A [[List]] that holds components data.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/data/} for more info
 */
class ListData extends List {
    constructor() {
        super(...arguments);
        /**
         * An optional processor for data.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/data/#Pre_processing_data} for more info
         */
        Object.defineProperty(this, "processor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * @ignore
     */
    incrementRef() { }
    /**
     * @ignore
     */
    decrementRef() { }
    _onPush(newValue) {
        if (this.processor) {
            this.processor.processRow(newValue);
        }
        super._onPush(newValue);
    }
    _onInsertIndex(index, newValue) {
        if (this.processor) {
            this.processor.processRow(newValue);
        }
        super._onInsertIndex(index, newValue);
    }
    _onSetIndex(index, oldValue, newValue) {
        if (this.processor) {
            this.processor.processRow(newValue);
        }
        super._onSetIndex(index, oldValue, newValue);
    }
}

/**
 * A base element that holds data bit (data item) for any [[Component]].
 */
class DataItem extends Settings {
    constructor(component, dataContext, settings) {
        super(settings);
        /**
         * A data item's owener [[Component]].
         */
        Object.defineProperty(this, "component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * A reference to actual item in source data this item is based on.
         */
        Object.defineProperty(this, "dataContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * @todo requires description
         */
        Object.defineProperty(this, "bullets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * A set of "open" values.
         */
        Object.defineProperty(this, "open", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * A set of "close" values.
         */
        Object.defineProperty(this, "close", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.dataContext = dataContext;
        this.component = component;
        this._settings.visible = true;
        this._checkDirty();
    }
    /**
     * @ignore
     */
    markDirty() {
        this.component.markDirtyValues(this);
    }
    _startAnimation() {
        this.component._root._addAnimation(this);
    }
    _animationTime() {
        return this.component._root.animationTime;
    }
    _dispose() {
        if (this.component) {
            this.component.disposeDataItem(this);
        }
        super._dispose();
    }
    /**
     * Shows a data item that's currently hidden.
     */
    show(duration) {
        this.setRaw("visible", true);
        if (this.component) {
            this.component.showDataItem(this, duration);
        }
    }
    /**
     * Hides a data item that's currently visible.
     */
    hide(duration) {
        this.setRaw("visible", false);
        if (this.component) {
            this.component.hideDataItem(this, duration);
        }
    }
    isHidden() {
        return !this.get("visible");
    }
}
/**
 * A base class for elements that make use of data.
 */
class Component extends Container {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ListData()
        });
        Object.defineProperty(this, "_dataItems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_mainDataItems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._dataItems
        });
        Object.defineProperty(this, "valueFields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "fields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["id"]
        });
        Object.defineProperty(this, "_valueFields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_valueFieldsF", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fieldsF", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_valuesDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_dataChanged", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_dataGrouped", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * Indicates if the component has already been initialized.
         */
        Object.defineProperty(this, "inited", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /**
     * Component's data.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/data/} for more info
     */
    set data(data) {
        data.incrementRef();
        this._data.decrementRef();
        this._data = data;
    }
    /**
     * @return  Data
     */
    get data() {
        return this._data;
    }
    _dispose() {
        super._dispose();
        this._data.decrementRef();
    }
    _onDataClear() {
    }
    _afterNew() {
        super._afterNew();
        this._data.incrementRef();
        this._updateFields();
        this._disposers.push(this.data.events.onAll((change) => {
            const dataItems = this._mainDataItems;
            this.markDirtyValues();
            this._markDirtyGroup();
            this._dataChanged = true;
            if (change.type === "clear") {
                each$1(dataItems, (dataItem) => {
                    dataItem.dispose();
                });
                dataItems.length = 0;
                this._onDataClear();
            }
            else if (change.type === "push") {
                const dataItem = new DataItem(this, change.newValue, this._makeDataItem(change.newValue));
                dataItems.push(dataItem);
                this.processDataItem(dataItem);
            }
            else if (change.type === "setIndex") {
                const dataItem = dataItems[change.index];
                const properties = this._makeDataItem(change.newValue);
                if (dataItem.bullets && dataItem.bullets.length == 0) {
                    dataItem.bullets = undefined;
                }
                keys(properties).forEach((key) => {
                    dataItem.animate({
                        key: key,
                        to: properties[key],
                        duration: this.get("interpolationDuration", 0),
                        easing: this.get("interpolationEasing"),
                    });
                });
                dataItem.dataContext = change.newValue;
            }
            else if (change.type === "insertIndex") {
                const dataItem = new DataItem(this, change.newValue, this._makeDataItem(change.newValue));
                dataItems.splice(change.index, 0, dataItem);
                this.processDataItem(dataItem);
            }
            else if (change.type === "removeIndex") {
                const dataItem = dataItems[change.index];
                dataItem.dispose();
                dataItems.splice(change.index, 1);
            }
            else if (change.type === "moveIndex") {
                const dataItem = dataItems[change.oldIndex];
                dataItems.splice(change.oldIndex, 1);
                dataItems.splice(change.newIndex, 0, dataItem);
            }
            else {
                throw new Error("Unknown IStreamEvent type");
            }
            this._afterDataChange();
        }));
    }
    _updateFields() {
        if (this.valueFields) {
            this._valueFields = [];
            this._valueFieldsF = {};
            each$1(this.valueFields, (key) => {
                const field = this.get((key + "Field"));
                if (field) {
                    this._valueFields.push(key);
                    this._valueFieldsF[key] = { fieldKey: key + "Field", workingKey: key + "Working" };
                }
            });
        }
        if (this.fields) {
            this._fields = [];
            this._fieldsF = {};
            each$1(this.fields, (key) => {
                const field = this.get((key + "Field"));
                if (field) {
                    this._fields.push(key);
                    this._fieldsF[key] = key + "Field";
                }
            });
        }
    }
    /**
     * A list of component's data items.
     *
     * @return  Data items
     */
    get dataItems() {
        return this._dataItems;
    }
    processDataItem(_dataItem) { }
    _makeDataItem(data) {
        //const output: this["_dataItemSettings"] = {};
        const output = {}; // temporary to solve error
        if (this._valueFields) {
            each$1(this._valueFields, (key) => {
                const field = this.get((this._valueFieldsF[key].fieldKey));
                output[key] = data[field];
                output[this._valueFieldsF[key].workingKey] = output[key];
            });
        }
        if (this._fields) {
            each$1(this._fields, (key) => {
                const field = this.get((this._fieldsF[key]));
                output[key] = data[field];
            });
        }
        return output;
    }
    /**
     * Creates a new data item and processes it.
     *
     * @param   data         Data item settings
     * @param   dataContext  Data context
     * @return               New data item
     */
    makeDataItem(data, dataContext) {
        let dataItem = new DataItem(this, dataContext, data);
        this.processDataItem(dataItem);
        return dataItem;
    }
    /**
     * Adds new explicit data item to series.
     *
     * @param   data         Data item settings
     * @param   dataContext  Data context
     * @return               New data item
     */
    pushDataItem(data, dataContext) {
        const dataItem = this.makeDataItem(data, dataContext);
        this._mainDataItems.push(dataItem);
        return dataItem;
    }
    /**
     * @ignore
     */
    disposeDataItem(_dataItem) {
    }
    /**
     * Shows component's data item.
     *
     * @param   dataItem   Data item
     * @param   _duration  Animation duration in milliseconds
     * @return             Promise
     */
    showDataItem(dataItem, _duration) {
        return __awaiter(this, void 0, void 0, function* () {
            dataItem.set("visible", true);
        });
    }
    /**
     * Hides component's data item.
     *
     * @param   dataItem   Data item
     * @param   _duration  Animation duration in milliseconds
     * @return             Promise
     */
    hideDataItem(dataItem, _duration) {
        return __awaiter(this, void 0, void 0, function* () {
            dataItem.set("visible", false);
        });
    }
    _clearDirty() {
        super._clearDirty();
        this._valuesDirty = false;
    }
    _afterDataChange() {
    }
    _afterChanged() {
        super._afterChanged();
        if (this._dataChanged) {
            const type = "datavalidated";
            if (this.events.isEnabled(type)) {
                this.events.dispatch(type, { type: type, target: this });
            }
            this._dataChanged = false;
        }
        if (this._valuesDirty) {
            const type = "valueschanged";
            if (this.events.isEnabled(type)) {
                this.events.dispatch(type, { type: type, target: this });
            }
        }
        this.inited = true;
    }
    /**
     * Forces a repaint of the element which relies on data.
     *
     * @since 5.0.21
     */
    markDirtyValues(_dataItem) {
        this.markDirty();
        this._valuesDirty = true;
    }
    _markDirtyGroup() {
        this._dataGrouped = false;
    }
    /**
     * @ignore
     */
    markDirtySize() {
        this._sizeDirty = true;
        this.markDirty();
    }
    /**
     * Looks up and returns a data item by its ID.
     *
     * @param   id  ID
     * @return      Data item
     */
    getDataItemById(id) {
        return find(this.dataItems, (dataItem) => {
            return dataItem.get("id") == id;
        });
    }
}
Object.defineProperty(Component, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Component"
});
Object.defineProperty(Component, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Container.classNames.concat([Component.className])
});

/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
/**
 * Returns a `Promise` which can be used to execute code after number of
 * milliseconds.
 *
 * @param   ms  Sleep duration in ms
 * @return      Promise
 */
function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}
/**
 * "Rounds" the date to specific time unit.
 *
 * @param date             Source date
 * @param unit             Time unit
 * @param count            Number of units to round to
 * @param firstDateOfWeek  First day of week
 * @param utc              Use UTC timezone
 * @param firstDate        First date to round to
 * @param roundMinutes     Minutes to round to (some timezones use non-whole hour)
 * @param timezone         Use specific named timezone when rounding
 * @return New date
 */
function round(date, unit, count, firstDateOfWeek, utc, firstDate, timezone) {
    if (!timezone || utc) {
        let timeZoneOffset = 0;
        if (!utc && unit != "millisecond") {
            timeZoneOffset = date.getTimezoneOffset();
            date.setUTCMinutes(date.getUTCMinutes() - timeZoneOffset);
        }
        switch (unit) {
            case "day":
                let day = date.getUTCDate();
                if (count > 1) ;
                else {
                    date.setUTCDate(day);
                }
                date.setUTCHours(0, 0, 0, 0);
                break;
            case "second":
                let seconds = date.getUTCSeconds();
                if (count > 1) {
                    seconds = Math.floor(seconds / count) * count;
                }
                date.setUTCSeconds(seconds, 0);
                break;
            case "millisecond":
                if (count == 1) {
                    return date; // much better for perf!
                }
                let milliseconds = date.getUTCMilliseconds();
                milliseconds = Math.floor(milliseconds / count) * count;
                date.setUTCMilliseconds(milliseconds);
                break;
            case "hour":
                let hours = date.getUTCHours();
                if (count > 1) {
                    hours = Math.floor(hours / count) * count;
                }
                date.setUTCHours(hours, 0, 0, 0);
                break;
            case "minute":
                let minutes = date.getUTCMinutes();
                if (count > 1) {
                    minutes = Math.floor(minutes / count) * count;
                }
                date.setUTCMinutes(minutes, 0, 0);
                break;
            case "month":
                let month = date.getUTCMonth();
                if (count > 1) {
                    // only do this if count is 2, 3, 4, and 6
                    if (count == 2 || count == 3 || count == 4 || count == 6) {
                        month = Math.floor(month / count) * count;
                    }
                }
                date.setUTCMonth(month, 1);
                date.setUTCHours(0, 0, 0, 0);
                break;
            case "year":
                let year = date.getUTCFullYear();
                if (count > 1) {
                    year = Math.floor(year / count) * count;
                }
                date.setUTCFullYear(year, 0, 1);
                date.setUTCHours(0, 0, 0, 0);
                break;
            case "week":
                let wday = date.getUTCDate();
                let weekDay = date.getUTCDay();
                if (!isNumber(firstDateOfWeek)) {
                    firstDateOfWeek = 1;
                }
                if (weekDay >= firstDateOfWeek) {
                    wday = wday - weekDay + firstDateOfWeek;
                }
                else {
                    wday = wday - (7 + weekDay) + firstDateOfWeek;
                }
                date.setUTCDate(wday);
                date.setUTCHours(0, 0, 0, 0);
                break;
        }
        if (!utc && unit != "millisecond") {
            date.setUTCMinutes(date.getUTCMinutes() + timeZoneOffset);
            if (unit == "day" || unit == "week" || unit == "month" || unit == "year") {
                let newTimeZoneOffset = date.getTimezoneOffset();
                if (newTimeZoneOffset != timeZoneOffset) {
                    let diff = newTimeZoneOffset - timeZoneOffset;
                    date.setUTCMinutes(date.getUTCMinutes() + diff);
                }
            }
        }
        return date;
    }
    else {
        if (isNaN(date.getTime())) {
            return date;
        }
        let initialTime = date.getTime();
        let tzoffset = timezone.offsetUTC(date);
        let timeZoneOffset = date.getTimezoneOffset();
        let parsedDate = timezone.parseDate(date);
        let year = parsedDate.year;
        let month = parsedDate.month;
        let day = parsedDate.day;
        let hour = parsedDate.hour;
        let minute = parsedDate.minute;
        let second = parsedDate.second;
        let millisecond = parsedDate.millisecond;
        let weekday = parsedDate.weekday;
        let offsetDif = tzoffset - timeZoneOffset;
        switch (unit) {
            case "day":
                hour = 0;
                minute = offsetDif;
                second = 0;
                millisecond = 0;
                break;
            case "second":
                minute += offsetDif;
                if (count > 1) {
                    second = Math.floor(second / count) * count;
                }
                millisecond = 0;
                break;
            case "millisecond":
                minute += offsetDif;
                if (count > 1) {
                    millisecond = Math.floor(millisecond / count) * count;
                }
                break;
            case "hour":
                if (count > 1) {
                    hour = Math.floor(hour / count) * count;
                }
                minute = offsetDif;
                second = 0;
                millisecond = 0;
                break;
            case "minute":
                if (count > 1) {
                    minute = Math.floor(minute / count) * count;
                }
                minute += offsetDif;
                second = 0;
                millisecond = 0;
                break;
            case "month":
                if (count > 1) {
                    month = Math.floor(month / count) * count;
                }
                day = 1;
                hour = 0;
                minute = offsetDif;
                second = 0;
                millisecond = 0;
                break;
            case "year":
                if (count > 1) {
                    year = Math.floor(year / count) * count;
                }
                month = 0;
                day = 1;
                hour = 0;
                minute = offsetDif;
                second = 0;
                millisecond = 0;
                break;
            case "week":
                if (!isNumber(firstDateOfWeek)) {
                    firstDateOfWeek = 1;
                }
                if (weekday >= firstDateOfWeek) {
                    day = day - weekday + firstDateOfWeek;
                }
                else {
                    day = day - (7 + weekday) + firstDateOfWeek;
                }
                hour = 0;
                minute = offsetDif;
                second = 0;
                millisecond = 0;
                break;
        }
        date = new Date(year, month, day, hour, minute, second, millisecond);
        // fix to solve #101989
        const newTime = date.getTime();
        let hDuration = 3600000;
        if (unit == "hour") {
            hDuration = 3600000 * count;
        }
        if (newTime + hDuration <= initialTime) {
            if (unit == "hour" || unit == "minute" || unit == "second" || unit == "millisecond") {
                date = new Date(newTime + hDuration);
            }
        }
        // end of fix
        let newTimeZoneOffset = date.getTimezoneOffset();
        let newTzoffset = timezone.offsetUTC(date);
        let newDiff = newTzoffset - newTimeZoneOffset;
        if (newDiff != offsetDif) {
            date.setTime(date.getTime() + (newDiff - offsetDif) * 60000);
        }
        return date;
    }
}

/**
 * A base class for all series.
 */
class Series extends Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_aggregatesCalculated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_selectionAggregatesCalculated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_dataProcessed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_psi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_pei", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_baseSeriesDirty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * A chart series belongs to.
         */
        Object.defineProperty(this, "chart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * List of bullets to use for the series.
         *
         * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/bullets/} for more info
         */
        Object.defineProperty(this, "bullets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new List()
        });
        /**
         * A [[Container]] series' bullets are stored in.
         *
         * @default Container.new()
         */
        Object.defineProperty(this, "bulletsContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Container.new(this._root, { width: p100, height: p100, position: "absolute" })
        });
    }
    _afterNew() {
        this.valueFields.push("value", "customValue");
        super._afterNew();
        this.setPrivate("customData", {});
        this._disposers.push(this.bullets.events.onAll((change) => {
            if (change.type === "clear") {
                this._handleBullets(this.dataItems);
            }
            else if (change.type === "push") {
                this._handleBullets(this.dataItems);
            }
            else if (change.type === "setIndex") {
                this._handleBullets(this.dataItems);
            }
            else if (change.type === "insertIndex") {
                this._handleBullets(this.dataItems);
            }
            else if (change.type === "removeIndex") {
                this._handleBullets(this.dataItems);
            }
            else if (change.type === "moveIndex") {
                this._handleBullets(this.dataItems);
            }
            else {
                throw new Error("Unknown IListEvent type");
            }
        }));
    }
    _dispose() {
        this.bulletsContainer.dispose(); // can be in a different parent
        super._dispose();
    }
    startIndex() {
        let len = this.dataItems.length;
        return Math.min(this.getPrivate("startIndex", 0), len);
    }
    endIndex() {
        let len = this.dataItems.length;
        return Math.max(0, Math.min(this.getPrivate("endIndex", len), len));
    }
    _handleBullets(dataItems) {
        each$1(dataItems, (dataItem) => {
            const bullets = dataItem.bullets;
            if (bullets) {
                each$1(bullets, (bullet) => {
                    bullet.dispose();
                });
                dataItem.bullets = undefined;
            }
        });
        this.markDirtyValues();
    }
    _makeBullets(dataItem) {
        if (this._shouldMakeBullet(dataItem)) {
            dataItem.bullets = [];
            this.bullets.each((bulletFunction) => {
                this._makeBullet(dataItem, bulletFunction);
            });
        }
    }
    _shouldMakeBullet(_dataItem) {
        return true;
    }
    _makeBullet(dataItem, bulletFunction, index) {
        const bullet = bulletFunction(this._root, this, dataItem);
        if (bullet) {
            bullet._index = index;
            this._makeBulletReal(dataItem, bullet);
        }
        return bullet;
    }
    _makeBulletReal(dataItem, bullet) {
        let sprite = bullet.get("sprite");
        if (sprite) {
            sprite._setDataItem(dataItem);
            sprite.setRaw("position", "absolute");
            this.bulletsContainer.children.push(sprite);
        }
        bullet.series = this;
        dataItem.bullets.push(bullet);
    }
    /**
     * Adds bullet directly to a data item.
     *
     * Please note: method accepts [[Bullet]] instance as a paramter, not a
     * reference to a function.
     *
     * You should add Bullet instance, not a method like you do it on series.
     *
     * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/bullets/#Adding_directly_to_data_item} for more info
     * @since 5.6.0
     *
     * @param  dataItem  Target data item
     * @param  bullet    Bullet instance
     */
    addBullet(dataItem, bullet) {
        if (!dataItem.bullets) {
            dataItem.bullets = [];
        }
        if (bullet) {
            this._makeBulletReal(dataItem, bullet);
        }
    }
    _clearDirty() {
        super._clearDirty();
        this._aggregatesCalculated = false;
        this._baseSeriesDirty = false;
        this._selectionAggregatesCalculated = false;
    }
    _prepareChildren() {
        super._prepareChildren();
        let startIndex = this.startIndex();
        let endIndex = this.endIndex();
        if (this.isDirty("name")) {
            this.updateLegendValue();
        }
        if (this.isDirty("heatRules")) {
            this._valuesDirty = true;
        }
        if (this.isPrivateDirty("baseValueSeries")) {
            const baseValueSeries = this.getPrivate("baseValueSeries");
            if (baseValueSeries) {
                this._disposers.push(baseValueSeries.onPrivate("startIndex", () => {
                    this._baseSeriesDirty = true;
                    this.markDirtyValues();
                }));
            }
        }
        const calculateAggregates = this.get("calculateAggregates");
        if (calculateAggregates) {
            if (this._valuesDirty && !this._dataProcessed) {
                if (!this._aggregatesCalculated) {
                    this._calculateAggregates(0, this.dataItems.length);
                    this._aggregatesCalculated = true;
                    if (startIndex != 0) {
                        this._psi = undefined;
                    }
                }
            }
            if ((this._psi != startIndex || this._pei != endIndex || this.isPrivateDirty("adjustedStartIndex")) && !this._selectionAggregatesCalculated) {
                if (startIndex === 0 && endIndex === this.dataItems.length && this._aggregatesCalculated) ;
                else {
                    this._calculateAggregates(startIndex, endIndex);
                }
                this._selectionAggregatesCalculated = true;
            }
        }
        if (this.isDirty("tooltip")) {
            let tooltip = this.get("tooltip");
            if (tooltip) {
                tooltip.hide(0);
                tooltip.set("tooltipTarget", this);
            }
        }
        if (this.isDirty("fill") || this.isDirty("stroke")) {
            let markerRectangle;
            const legendDataItem = this.get("legendDataItem");
            if (legendDataItem) {
                markerRectangle = legendDataItem.get("markerRectangle");
                if (markerRectangle) {
                    if (this.isVisible()) {
                        if (this.isDirty("stroke")) {
                            let stroke = this.get("stroke");
                            markerRectangle.set("stroke", stroke);
                        }
                        if (this.isDirty("fill")) {
                            let fill = this.get("fill");
                            markerRectangle.set("fill", fill);
                        }
                    }
                }
            }
            this.updateLegendMarker(undefined);
        }
        if (this.bullets.length > 0) {
            let startIndex = this.startIndex();
            let endIndex = this.endIndex();
            if (endIndex < this.dataItems.length) {
                endIndex++;
            }
            for (let i = startIndex; i < endIndex; i++) {
                let dataItem = this.dataItems[i];
                if (!dataItem.bullets) {
                    this._makeBullets(dataItem);
                }
            }
        }
    }
    _handleRemoved() {
    }
    /**
     * @ignore
     */
    _adjustStartIndex(index) {
        return index;
    }
    _calculateAggregates(startIndex, endIndex) {
        let fields = this._valueFields;
        if (!fields) {
            throw new Error("No value fields are set for the series.");
        }
        const sum = {};
        const absSum = {};
        const count = {};
        const low = {};
        const high = {};
        const open = {};
        const close = {};
        const average = {};
        const previous = {};
        each$1(fields, (key) => {
            sum[key] = 0;
            absSum[key] = 0;
            count[key] = 0;
        });
        const len = this.dataItems.length;
        each$1(fields, (key) => {
            let change = key + "Change";
            let changePercent = key + "ChangePercent";
            let changePrevious = key + "ChangePrevious";
            let changePreviousPercent = key + "ChangePreviousPercent";
            let changeSelection = key + "ChangeSelection";
            let changeSelectionPercent = key + "ChangeSelectionPercent";
            let openKey = "valueY";
            if (key == "valueX" || key == "openValueX" || key == "lowValueX" || key == "highValueX") {
                openKey = "valueX";
            }
            const baseValueSeries = this.getPrivate("baseValueSeries");
            const adjustedStartIndex = this.getPrivate("adjustedStartIndex", startIndex);
            // Function to calculate changes for a single data item
            const calculateChangesForItem = (dataItem, key) => {
                if (dataItem) {
                    let value = dataItem.get(key);
                    if (value != null) {
                        dataItem.setRaw((changePrevious), value - previous[openKey]);
                        dataItem.setRaw((changePreviousPercent), (value - previous[openKey]) / previous[openKey] * 100);
                        dataItem.setRaw((changeSelection), value - open[openKey]);
                        dataItem.setRaw((changeSelectionPercent), (value - open[openKey]) / open[openKey] * 100);
                        previous[key] = value;
                    }
                }
            };
            for (let i = adjustedStartIndex; i < endIndex; i++) {
                const dataItem = this.dataItems[i];
                if (dataItem) {
                    let value = dataItem.get(key);
                    if (value != null) {
                        count[key]++;
                        sum[key] += value;
                        absSum[key] += Math.abs(value);
                        average[key] = sum[key] / count[key];
                        if (low[key] > value || low[key] == null) {
                            low[key] = value;
                        }
                        if (high[key] < value || high[key] == null) {
                            high[key] = value;
                        }
                        close[key] = value;
                        if (open[key] == null) {
                            open[key] = value;
                            previous[key] = value;
                            if (baseValueSeries) {
                                open[openKey] = baseValueSeries._getBase(openKey);
                            }
                        }
                        if (startIndex === 0) {
                            dataItem.setRaw((change), value - open[openKey]);
                            dataItem.setRaw((changePercent), (value - open[openKey]) / open[openKey] * 100);
                        }
                        calculateChangesForItem(dataItem, key);
                    }
                }
            }
            // Calculate for endIndex item
            if (endIndex < len) {
                calculateChangesForItem(this.dataItems[endIndex], key);
            }
            // Calculate for endIndex+1 item if available
            if (endIndex + 1 < len) {
                calculateChangesForItem(this.dataItems[endIndex + 1], key);
            }
            if (startIndex > 0) {
                startIndex--;
            }
            delete previous[key];
            for (let i = startIndex; i < adjustedStartIndex; i++) {
                const dataItem = this.dataItems[i];
                if (dataItem) {
                    let value = dataItem.get(key);
                    if (previous[key] == null) {
                        previous[key] = value;
                    }
                    if (value != null) {
                        dataItem.setRaw((changePrevious), value - previous[openKey]);
                        dataItem.setRaw((changePreviousPercent), (value - previous[openKey]) / previous[openKey] * 100);
                        dataItem.setRaw((changeSelection), value - open[openKey]);
                        dataItem.setRaw((changeSelectionPercent), (value - open[openKey]) / open[openKey] * 100);
                        previous[key] = value;
                    }
                }
            }
        });
        each$1(fields, (key) => {
            this.setPrivate((key + "AverageSelection"), average[key]);
            this.setPrivate((key + "CountSelection"), count[key]);
            this.setPrivate((key + "SumSelection"), sum[key]);
            this.setPrivate((key + "AbsoluteSumSelection"), absSum[key]);
            this.setPrivate((key + "LowSelection"), low[key]);
            this.setPrivate((key + "HighSelection"), high[key]);
            this.setPrivate((key + "OpenSelection"), open[key]);
            this.setPrivate((key + "CloseSelection"), close[key]);
        });
        if (startIndex === 0 && endIndex === len) {
            each$1(fields, (key) => {
                this.setPrivate((key + "Average"), average[key]);
                this.setPrivate((key + "Count"), count[key]);
                this.setPrivate((key + "Sum"), sum[key]);
                this.setPrivate((key + "AbsoluteSum"), absSum[key]);
                this.setPrivate((key + "Low"), low[key]);
                this.setPrivate((key + "High"), high[key]);
                this.setPrivate((key + "Open"), open[key]);
                this.setPrivate((key + "Close"), close[key]);
            });
        }
    }
    _updateChildren() {
        super._updateChildren();
        this._psi = this.startIndex();
        this._pei = this.endIndex();
        if (this.isDirty("visible")) {
            this.bulletsContainer.set("visible", this.get("visible"));
        }
        // Apply heat rules
        const rules = this.get("heatRules");
        if (this._valuesDirty && rules && rules.length > 0) {
            each$1(rules, (rule) => {
                const minValue = rule.minValue || this.getPrivate((rule.dataField + "Low")) || 0;
                const maxValue = rule.maxValue || this.getPrivate((rule.dataField + "High")) || 0;
                each$1(rule.target._entities, (target) => {
                    const value = target.dataItem.get(rule.dataField);
                    if (!isNumber(value)) {
                        if (rule.neutral) {
                            target.set(rule.key, rule.neutral);
                        }
                        const states = target.states;
                        if (states) {
                            const defaultState = states.lookup("default");
                            if (defaultState && rule.neutral) {
                                defaultState.set(rule.key, rule.neutral);
                            }
                        }
                        if (!rule.customFunction) {
                            return;
                        }
                    }
                    if (rule.customFunction) {
                        rule.customFunction.call(this, target, minValue, maxValue, value);
                    }
                    else {
                        let percent;
                        if (rule.logarithmic) {
                            percent = (Math.log(value) * Math.LOG10E - Math.log(minValue) * Math.LOG10E) / ((Math.log(maxValue) * Math.LOG10E - Math.log(minValue) * Math.LOG10E));
                        }
                        else {
                            percent = (value - minValue) / (maxValue - minValue);
                        }
                        if (isNumber(value) && (!isNumber(percent) || Math.abs(percent) == Infinity)) {
                            percent = 0.5;
                        }
                        // fixes problems if all values are the same
                        let propertyValue;
                        if (isNumber(rule.min)) {
                            propertyValue = rule.min + (rule.max - rule.min) * percent;
                        }
                        else if (rule.min instanceof Color) {
                            propertyValue = Color.interpolate(percent, rule.min, rule.max);
                        }
                        else if (rule.min instanceof Percent) {
                            propertyValue = percentInterpolate(percent, rule.min, rule.max);
                        }
                        target.set(rule.key, propertyValue);
                        const states = target.states;
                        if (states) {
                            const defaultState = states.lookup("default");
                            if (defaultState) {
                                defaultState.set(rule.key, propertyValue);
                            }
                        }
                    }
                });
            });
        }
        if (this.get("visible")) {
            let count = this.dataItems.length;
            let startIndex = this.startIndex();
            let endIndex = this.endIndex();
            if (endIndex < count) {
                endIndex++;
            }
            if (startIndex > 0) {
                startIndex--;
            }
            for (let i = 0; i < startIndex; i++) {
                this._hideBullets(this.dataItems[i]);
            }
            for (let i = startIndex; i < endIndex; i++) {
                this._positionBullets(this.dataItems[i]);
            }
            for (let i = endIndex; i < count; i++) {
                this._hideBullets(this.dataItems[i]);
            }
        }
    }
    _positionBullets(dataItem) {
        if (dataItem.bullets) {
            each$1(dataItem.bullets, (bullet) => {
                this._positionBullet(bullet);
                const sprite = bullet.get("sprite");
                if (bullet.get("dynamic")) {
                    if (sprite) {
                        sprite._markDirtyKey("fill");
                        sprite.markDirtySize();
                    }
                    if (sprite instanceof Container) {
                        sprite.walkChildren((child) => {
                            child._markDirtyKey("fill");
                            child.markDirtySize();
                            if (child instanceof Label) {
                                child.text.markDirtyText();
                            }
                        });
                    }
                }
                if (sprite instanceof Label && sprite.get("populateText")) {
                    sprite.text.markDirtyText();
                }
            });
        }
    }
    _hideBullets(dataItem) {
        if (dataItem.bullets) {
            each$1(dataItem.bullets, (bullet) => {
                let sprite = bullet.get("sprite");
                if (sprite) {
                    sprite.setPrivate("visible", false);
                }
            });
        }
    }
    _positionBullet(_bullet) {
    }
    _placeBulletsContainer(chart) {
        chart.bulletsContainer.children.moveValue(this.bulletsContainer);
    }
    _removeBulletsContainer() {
        const bulletsContainer = this.bulletsContainer;
        if (bulletsContainer.parent) {
            bulletsContainer.parent.children.removeValue(bulletsContainer);
        }
    }
    /**
     * @ignore
     */
    disposeDataItem(dataItem) {
        //super.disposeDataItem(dataItem); // does nothing
        const bullets = dataItem.bullets;
        if (bullets) {
            each$1(bullets, (bullet) => {
                bullet.dispose();
            });
            dataItem.bullets = undefined;
        }
    }
    _getItemReaderLabel() {
        return "";
    }
    /**
     * Shows series's data item.
     *
     * @param   dataItem  Data item
     * @param   duration  Animation duration in milliseconds
     * @return            Promise
     */
    showDataItem(dataItem, duration) {
        const _super = Object.create(null, {
            showDataItem: { get: () => super.showDataItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [_super.showDataItem.call(this, dataItem, duration)];
            const bullets = dataItem.bullets;
            if (bullets) {
                each$1(bullets, (bullet) => {
                    const sprite = bullet.get("sprite");
                    if (sprite) {
                        promises.push(sprite.show(duration));
                    }
                });
            }
            yield Promise.all(promises);
        });
    }
    /**
     * Hides series's data item.
     *
     * @param   dataItem  Data item
     * @param   duration  Animation duration in milliseconds
     * @return            Promise
     */
    hideDataItem(dataItem, duration) {
        const _super = Object.create(null, {
            hideDataItem: { get: () => super.hideDataItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [_super.hideDataItem.call(this, dataItem, duration)];
            const bullets = dataItem.bullets;
            if (bullets) {
                each$1(bullets, (bullet) => {
                    const sprite = bullet.get("sprite");
                    if (sprite) {
                        promises.push(sprite.hide(duration));
                    }
                });
            }
            yield Promise.all(promises);
        });
    }
    _sequencedShowHide(show, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.get("sequencedInterpolation")) {
                if (!isNumber(duration)) {
                    duration = this.get("interpolationDuration", 0);
                }
                if (duration > 0) {
                    const startIndex = this.startIndex();
                    const endIndex = this.endIndex();
                    yield Promise.all(map(this.dataItems, (dataItem, i) => __awaiter(this, void 0, void 0, function* () {
                        let realDuration = duration || 0;
                        if (i < startIndex - 10 || i > endIndex + 10) {
                            realDuration = 0;
                        }
                        //let delay = this.get("sequencedDelay", 0) * i + realDuration * (i - startIndex) / (endIndex - startIndex);
                        let delay = this.get("sequencedDelay", 0) + realDuration / (endIndex - startIndex);
                        yield sleep(delay * (i - startIndex));
                        if (show) {
                            yield this.showDataItem(dataItem, realDuration);
                        }
                        else {
                            yield this.hideDataItem(dataItem, realDuration);
                        }
                    })));
                }
                else {
                    yield Promise.all(map(this.dataItems, (dataItem) => {
                        if (show) {
                            return this.showDataItem(dataItem, 0);
                        }
                        else {
                            return this.hideDataItem(dataItem, 0);
                        }
                    }));
                }
            }
        });
    }
    /**
     * @ignore
     */
    updateLegendValue(dataItem) {
        if (dataItem) {
            const legendDataItem = dataItem.get("legendDataItem");
            if (legendDataItem) {
                const valueLabel = legendDataItem.get("valueLabel");
                if (valueLabel) {
                    const text = valueLabel.text;
                    let txt = "";
                    valueLabel._setDataItem(dataItem);
                    txt = this.get("legendValueText", text.get("text", ""));
                    valueLabel.set("text", txt);
                    text.markDirtyText();
                }
                const label = legendDataItem.get("label");
                if (label) {
                    const text = label.text;
                    let txt = "";
                    label._setDataItem(dataItem);
                    txt = this.get("legendLabelText", text.get("text", ""));
                    label.set("text", txt);
                    text.markDirtyText();
                }
            }
        }
    }
    /**
     * @ignore
     */
    updateLegendMarker(_dataItem) {
    }
    _onHide() {
        super._onHide();
        const tooltip = this.getTooltip();
        if (tooltip) {
            tooltip.hide();
        }
    }
    /**
     * @ignore
     */
    hoverDataItem(_dataItem) { }
    /**
     * @ignore
     */
    unhoverDataItem(_dataItem) { }
    /**
     * @ignore
     */
    _getBase(key) {
        const dataItem = this.dataItems[this.startIndex()];
        if (dataItem) {
            return dataItem.get(key);
        }
        return 0;
    }
}
Object.defineProperty(Series, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Series"
});
Object.defineProperty(Series, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Component.classNames.concat([Series.className])
});

/** @ignore */ /** */
/**
 * @ignore
 */
function segmentedLine(display, segments) {
    for (let s = 0, len = segments.length; s < len; s++) {
        const groups = segments[s];
        if (groups.length > 0) {
            let firstGroup = groups[0];
            if (firstGroup.length > 0) {
                let firstPoint = firstGroup[0];
                display.moveTo(firstPoint.x, firstPoint.y);
                for (let g = 0, len = groups.length; g < len; g++) {
                    line(display, groups[g]);
                }
            }
        }
    }
}
/**
 * @ignore
 */
function line(display, points) {
    for (let p = 0, len = points.length; p < len; p++) {
        const point = points[p];
        display.lineTo(point.x, point.y);
    }
}

/**
 * Draws a line.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 * @important
 */
class Line extends Graphics {
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("points") || this.isDirty("segments") || this._sizeDirty || this.isPrivateDirty("width") || this.isPrivateDirty("height")) {
            this._clear = true;
        }
    }
    _changed() {
        super._changed();
        if (this._clear) {
            const points = this.get("points");
            const segments = this.get("segments");
            if (points && points.length > 0) {
                let point = points[0];
                this._display.moveTo(point.x, point.y);
                segmentedLine(this._display, [[points]]);
            }
            else if (segments) {
                segmentedLine(this._display, segments);
            }
            else if (!this.get("draw")) {
                let w = this.width();
                let h = this.height();
                this._display.moveTo(0, 0);
                this._display.lineTo(w, h);
            }
        }
    }
}
Object.defineProperty(Line, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Line"
});
Object.defineProperty(Line, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Graphics.classNames.concat([Line.className])
});

/**
 * A base class for all charts.
 */
class Chart extends Container {
    constructor() {
        super(...arguments);
        /**
         * A [[Container]] chart places its elements in.
         *
         * @default Container.new()
         */
        Object.defineProperty(this, "chartContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.children.push(Container.new(this._root, { width: p100, height: p100, interactiveChildren: false }))
        });
        /**
         * A [[Container]] chart places its bullets in.
         *
         * @default Container.new()
         */
        Object.defineProperty(this, "bulletsContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Container.new(this._root, { interactiveChildren: false, isMeasured: false, position: "absolute", width: p100, height: p100 })
        });
    }
}
Object.defineProperty(Chart, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Chart"
});
Object.defineProperty(Chart, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Container.classNames.concat([Chart.className])
});

/**
 * A base class for all series-based charts.
 */
class SerialChart extends Chart {
    constructor() {
        super(...arguments);
        /**
         * A [[Container]] where chart will store all series.
         *
         * @default Container.new()
         */
        Object.defineProperty(this, "seriesContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Container.new(this._root, { width: p100, height: p100, isMeasured: false })
        });
        /**
         * A list of chart's series.
         */
        Object.defineProperty(this, "series", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ListAutoDispose()
        });
    }
    _afterNew() {
        super._afterNew();
        this._disposers.push(this.series);
        const children = this.seriesContainer.children;
        this._disposers.push(this.series.events.onAll((change) => {
            if (change.type === "clear") {
                each$1(change.oldValues, (series) => {
                    this._removeSeries(series);
                });
                const colors = this.get("colors");
                if (colors) {
                    colors.reset();
                }
                const patterns = this.get("patterns");
                if (patterns) {
                    patterns.reset();
                }
            }
            else if (change.type === "push") {
                children.moveValue(change.newValue);
                this._processSeries(change.newValue);
            }
            else if (change.type === "setIndex") {
                children.setIndex(change.index, change.newValue);
                this._processSeries(change.newValue);
            }
            else if (change.type === "insertIndex") {
                children.insertIndex(change.index, change.newValue);
                this._processSeries(change.newValue);
            }
            else if (change.type === "removeIndex") {
                this._removeSeries(change.oldValue);
            }
            else if (change.type === "moveIndex") {
                children.moveValue(change.value, change.newIndex);
                this._processSeries(change.value);
            }
            else if (change.type === "swap") {
                const a = change.a;
                const b = change.b;
                const aIndex = this.series.indexOf(a);
                const bIndex = this.series.indexOf(b);
                children.moveValue(a, bIndex);
                children.moveValue(b, aIndex);
                this.series.each((series) => {
                    this._processSeries(series);
                    series.markDirtyValues();
                });
            }
            else {
                throw new Error("Unknown IListEvent type");
            }
        }));
    }
    _processSeries(series) {
        series.chart = this;
        series._placeBulletsContainer(this);
    }
    _removeSeries(series) {
        series._handleRemoved();
        if (!series.isDisposed()) {
            this.seriesContainer.children.removeValue(series);
            series._removeBulletsContainer();
        }
    }
}
Object.defineProperty(SerialChart, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "SerialChart"
});
Object.defineProperty(SerialChart, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Chart.classNames.concat([SerialChart.className])
});

/**
 * Draws a tick element (mostly used on axes).
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/graphics/} for more info
 */
class Tick extends Line {
}
Object.defineProperty(Tick, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Tick"
});
Object.defineProperty(Tick, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Line.classNames.concat([Tick.className])
});

/**
 * An object which holds list of colors and can generate new ones.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/#Color_sets} for more info
 */
class ColorSet extends Entity {
    //protected _currentPass: number = 0;
    _afterNew() {
        // Applying themes because color set will not have parent
        super._afterNewApplyThemes();
        this._dirty["colors"] = false;
    }
    _beforeChanged() {
        if (this.isDirty("colors")) {
            this.reset();
        }
    }
    /**
     * @ignore
     */
    generateColors() {
        this.setPrivate("currentPass", this.getPrivate("currentPass", 0) + 1);
        const pass = this.getPrivate("currentPass");
        const colors = this.get("colors", [this.get("baseColor", Color.fromHex(0xff0000))]);
        if (!this.getPrivate("numColors")) {
            this.setPrivate("numColors", colors.length);
        }
        //const len = colors.length;
        const len = this.getPrivate("numColors");
        //const start = len - this.getPrivate("numColors")!;
        const start = 0;
        const passOptions = this.get("passOptions");
        const reuse = this.get("reuse");
        for (let i = start; i < len; i++) {
            if (reuse) {
                colors.push(colors[i]);
            }
            else {
                const hsl = colors[i].toHSL();
                let h = hsl.h + (passOptions.hue || 0) * pass;
                while (h > 1)
                    h -= 1;
                let s = hsl.s + (passOptions.saturation || 0) * pass;
                //if (s > 1) s -= Math.floor(s);
                if (s > 1)
                    s = 1;
                if (s < 0)
                    s = 0;
                let l = hsl.l + (passOptions.lightness || 0) * pass;
                //if (l > 1) l -= Math.floor(l);
                while (l > 1)
                    l -= 1;
                colors.push(Color.fromHSL(h, s, l));
            }
        }
    }
    /**
     * Returns a [[Color]] at specific index.
     *
     * If there's no color at this index, a new color is generated.
     *
     * @param   index  Index
     * @return         Color
     */
    getIndex(index) {
        const colors = this.get("colors", []);
        const saturation = this.get("saturation");
        if (index >= colors.length) {
            this.generateColors();
            return this.getIndex(index);
        }
        return saturation != null ? Color.saturate(colors[index], saturation) : colors[index];
    }
    /**
     * Returns next [[Color]] in the list.
     *
     * If the list is out of colors, new ones are generated dynamically.
     */
    next() {
        let currentStep = this.getPrivate("currentStep", this.get("startIndex", 0));
        this.setPrivate("currentStep", currentStep + this.get("step", 1));
        return this.getIndex(currentStep);
    }
    /**
     * Resets counter to the start of the list, so the next call for `next()` will
     * return the first color.
     */
    reset() {
        this.setPrivate("currentStep", this.get("startIndex", 0));
        this.setPrivate("currentPass", 0);
    }
}
Object.defineProperty(ColorSet, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "ColorSet"
});
Object.defineProperty(ColorSet, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([ColorSet.className])
});

/**
 * @ignore
 */
class AnimatedTheme extends Theme {
    setupDefaultRules() {
        super.setupDefaultRules();
        this.rule("Component").setAll({
            interpolationDuration: 600
        });
        this.rule("Hierarchy").set("animationDuration", 600);
        this.rule("Scrollbar").set("animationDuration", 600);
        this.rule("Tooltip").set("animationDuration", 300);
        this.rule("MapChart").set("animationDuration", 1000);
        this.rule("MapChart").set("wheelDuration", 300);
        this.rule("Entity").setAll({
            stateAnimationDuration: 600
        });
        this.rule("Sprite").states.create("default", { stateAnimationDuration: 600 });
        this.rule("Tooltip", ["axis"]).setAll({
            animationDuration: 200
        });
        this.rule("WordCloud").set("animationDuration", 500);
        this.rule("Polygon").set("animationDuration", 600);
        this.rule("ArcDiagram").set("animationDuration", 600);
    }
}

export { RADIANS as $, isNaN$1 as A, Component as B, Container as C, DataItem as D, decimalPlaces as E, fitToRange as F, Graphics as G, ceil as H, populateString as I, Label as J, Tick as K, ListAutoDispose as L, MultiDisposer as M, ListTemplate as N, Template as O, Percent as P, sameBounds as Q, RoundedRectangle as R, SerialChart as S, Theme as T, ready as U, Root as V, AnimatedTheme as W, color as X, Entity as Y, Text as Z, __awaiter as _, ColorSet as a, normalizeAngle as a0, cos as a1, sin as a2, getArcBounds as a3, mergeBounds as a4, out as a5, cubic as a6, Color as b, p50 as c, copy as d, copy$1 as e, round$1 as f, percent as g, Rectangle as h, isNumber as i, remove as j, isLocalEvent as k, keys as l, mergeTags as m, each as n, each$1 as o, p100 as p, move as q, round as r, setColor as s, compareNumber as t, Series as u, List as v, removeFirst as w, capitalizeFirst as x, relativeToValue as y, visualSettings as z };
//# sourceMappingURL=AnimatedTheme-xB288W7N.js.map
