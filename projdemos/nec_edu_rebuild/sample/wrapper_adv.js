/************************************
Compatible solution for native methods
 ************************************/
! function () {
    'use strict';
    if (typeof Object.create != 'function') {
        Object.create = function () {
            var Temp = function () {};
            return function (proto) {
                if (proto !== Object(proto) && proto !== null) {
                    console.log('Error: Object.create - parameter 1 must be an object, or null');
                }
                Temp.prototype = proto || {};
                var result = new Temp();
                Temp.prototype = null;
                // simulate Object.create(null)
                proto === null && (result.__proto__ = null);
                return result;
            }
        }();
    }
}();

! function () {
    'use strict';
    if (typeof Function.prototype.bind != 'function') {
        Function.prototype.bind = function (content) {
            if (typeof this != 'function') {
                console.log('Function.prototype.bind - what is trying to be bound is not callable.')
            }
            var args = Array.prototype.slice.call(arguments, 1),
                toBind = this;
            return function () {
                toBind.apply(content, args.concat(Array.prototype.slice.call(arguments)));
            }
        };
    }
}();
// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior
// deal with that slice can not be call with DOM elements in IE < 9
! function () {
    'use strict';
    var slice = Array.prototype.slice;
    try {
        // slice can not be used with DOM elements in IE < 9
        slice.call(document.documentElement);
    } catch (e) {
        Array.prototype.slice = function (begin, end) {
            end = typeof end != 'undefined' ? end : this.length;
            // if the caller is an native Array
            if (Object.prototype.toString.call(this).slice(8, -1) == 'Array') {
                return slice.call(this, begin, end);
            }
            var i, size, start, last,
                obj = Object(this),
                copy = [],
                len = obj.length;
            // format arguments
            start = typeof begin != 'number' ? 0 :
                begin >= 0 ? begin :
                Math.max(0, len + begin);
            last = typeof end != 'number' ? len :
                end >= 0 ? Math.min(end, len) :
                len + end;
            size = last - start;
            if (size > 0) {
                copy = new Array(size);
                // process when slice bound to a string
                if (obj.charAt) {
                    for (i = 0; i < size; i++) {
                        copy[i] = obj.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        copy[i] = obj[start + i];
                    }
                }
            }
            return copy;
        };
    }
}();

! function () {
    'use strict';
    if (typeof Array.prototype.indexOf != 'function') {
        Array.prototype.indexOf = function (itm) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
            }
            if (!(len = arr.length)) return;
            do {
                if (arr[i] === itm) return i;
            } while (++i < len);
            return -1;
        };
    }
}();

! function () {
    'use strict';
    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function (fn) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
            }
            if (!(len = arr.length)) return;
            do {
                fn(arr[i], i, arr);
            } while (++i < len);
            fn = null;
            arr = null;
        }
    }
}();

! function () {
    'use strict';
    if (typeof Array.prototype.reduce != 'function') {
        Array.prototype.reduce = function (fn, orig) {
            var arr = Object(this),
                i = 0,
                len = 0,
                pre = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
            }
            if (!(len = arr.length)) return;
            if (typeof orig != 'undefined') {
                pre = orig;
            } else {
                pre = arr[0];
                if (len === 1) {
                    return pre;
                }
                i++;
            }
            do {
                pre = fn(pre, arr[i], i, arr);
            } while (++i < len);
            fn = null;
            org = null;
            arr = null;
            return pre;
        }
    }
}();

! function () {
    'use strict';
    if (typeof Array.prototype.join != 'function') {
        Array.prototype.join = function (rep) {
            rep = String(rep);
            this.reduce(function (pre, crt, idx, arr) {
                return '' + pre + rep + crt;
            });
        }
    }
}();

/*****************************
Create the uTools function and namespace
 *****************************/
! function (global) {
    var _slice = Array.prototype.slice;
    var $ = global.uTools = function (val) {
        // 1. get DOM element(s)
        // 2. wrap object
        // 3. create wrapped object
        var m, elms, len, tmp,
            reg1 = /^\s*\<([\d\w]+)[\s\S]*\>[\s\S]*\<\/\1\>\s*$/, // complete tag
            reg2 = /^\s*\<([\d\w]+)[^\<\>]*\/\>\s*$/; // self-closed tag
        if (typeof val == 'string') {
            try {
                elms = document.querySelectorAll(val);
                len = elms.length;
            } catch (e) {
                if ($.fn.isIE()) {
                    console.log('Warning: window.uTools - querySelectorAll failed.');
                } else {
                    console.log(e);
                }
            }
            if (len) {
                return $.dom.wrp(_slice.call(elms));
            } else if (m = val.match(reg1) || val.match(reg2)) {
                tmp = document.createElement('div');
                tmp.innerHTML = val;
                elms = [];
                // can not use promise in async, because need for return
                _slice.call(tmp.childNodes).forEach(function (elm) {
                    elms.push(elm);
                });
                if (elms.length) {
                    return $.dom.wrp(elms);
                }
                (tmp = null), (elms = null), (reg1 = null), (reg2 = null), (m = null);
                return;
            }
        } else if ((m = $.fn.isNode(val)) || $.fn.isNode(val[0])) { // the DOM nodes
            elms = [];
            if (m) { // a single DOM node
                elms.push(val);
            } else { // an array-like collectio
                _slice.call(val).forEach(function (elm) {
                    elms.push(elm);
                });
            }
            return $.dom.wrp(elms);
        } else if (val.type == 'wrapped') { // the wrapped object
            return val;
        } else if (val && typeof val == 'object') { // the other type objects
            if (val.length == null) {
                return $.ev.wrp([val]);
            } else if ($.fn.isNumeric(val.length)) {
                elms = [];
                _slice.call(val).forEach(function (elm) {
                    elms.push(elm);
                });
            }
            return $.ev.wrp(elms);
        }
    };
    global._uTools = global.uTools;
}(window || self);

! function ($, global) {
    var _hasOwn = Object.prototype.hasOwnProperty,
        _getOwns = Object.getOwnPropertyNames,
        _slice = Array.prototype.slice,
        _create = Object.create;
    /******************************
        Common tool set
     ******************************/
    ! function () {
        $.fn = _create({
            /****************** detector *************/
            getTypeOf: function (obj) {
                var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
                if (type != 'object') return type;
                if (obj.constructor &&
                    !_hasOwn.call(obj, 'constructor') &&
                    !_hasOwn.call(obj, 'isPrototypeOf')) {
                    return obj.constructor.toString().match(/function\s*([^\(\s]*)/)[1].toLowerCase();
                }
            },

            // return true if it is a array
            isArray: function (obj) {
                return $.fn.getTypeOf(obj) == 'array';
            },
            // return true if it is a numeric number
            isNumeric: function (val) {
                if (typeof val == 'object') return false; // except object
                if (typeof val != 'number') return false; // except true, false, null, undefined
                if (!isFinite(val)) return false; // except undefined, NaN, Infinity
                return true;
            },
            // return true if it is a DOM node
            isNode: function (obj) {
                return typeof Node == 'object' ?
                    obj instanceof Node :
                    obj &&
                    typeof obj == 'object' &&
                    typeof obj.nodeType == 'number' &&
                    typeof obj.nodeName == 'string';
            },
            // return true if it is a DOM element
            isElement: function (obj) {
                return typeof HTMLElement == 'object' ? obj instanceof HTMLElement :
                    obj && typeof obj == 'object' && obj != null && obj.nodeType === 1 && typeof obj.nodeName == 'string';
            },
            // detect IE or IE version
            isIE: function (ver) {
                var b = document.createElement('b');
                b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->';
                return b.getElementsByTagName('i').length === 1;
            },

            /***************** performance optimization ******************/
            // lazy load some compatibly choosing function
            // @param {boolean|function} [determine condition]
            // @param {fn1}              [callback if expr is true]
            // @param {fn2}              [callback if expr is false]
            lazyLoad: function (expr, fn1, fn2) {
                if (typeof fn1 != 'function') {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 2 must be a function to be returned.');
                }
                if (typeof fn2 != 'function') {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 3 must be a function to be returned.');
                }
                if (typeof expr == 'boolean') {
                    return expr ? fn1 : fn2;
                } else if (typeof expr == 'function') {
                    return expr() ? fn1 : fn2;
                } else {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 1 should be a boolean value or a function to be called.');
                }
            },
            // lazy load assistant for easily using lazy load
            // @param {string} [the property name to verify]
            // @param {string} [the property native type]
            lazyLoadAid: function (name, type) {
                var b = document.createElement('b'),
                    t = typeof b[name] == type;
                b = null;
                return t;
            },
            // array chunk traversing auxiliary method
            // @param {number}   [interval time]
            // @param {array}    [array to traverse]
            // @param {function} [callback]
            // @param {object}   [bound context]
            chunk: function (arr, fn, intv, ctx) {
                if (!$.fn.isArray(arr)) {
                    console.log('Error: uTools.fn.chunk - The parameter 1 must be an array!');
                }
                if (!arr.length) return;
                if (typeof fn != 'function') return;
                if (intv != null && typeof intv != 'number') return;
                if (ctx != null && typeof ctx != 'object') return;
                // return a Promise for sometimes async needs
                return new $.Promise(function (resolve, reject) {
                    var copy = arr.slice(),
                        idx = 0;
                    intv = intv || 100; // if undefined or null
                    intv = intv > 0 ? ~~intv : 0; // get the non-negative and also integer
                    setTimeout(function f() {
                        var item = copy.shift();
                        fn.call(ctx, item, idx++, copy);
                        if (copy.length > 0) {
                            setTimeout(f, intv);
                        } else {
                            resolve('complete');
                        }
                    }, 0);
                });
            },
            // frequently process throttle method
            // @param {number}   [interval time]
            // @param {function} [callback]
            // @param {object}   [bound context]
            throttle: function (fn, ctx, intv) {
                if (typeof fn != 'function') {
                    console.log('Error: uTools.fn.throttle - The parameter 1 must be a function.');
                }
                clearTimeout(fn.tId);
                intv = intv || 200;
                fn.tId = setTimeout(function () {
                    fn.call(ctx);
                }, intv);
            },
            // traversal of array, array-like and object
            each: function (obj, fn) {
                var p, v;
                // convert NodeList into array if the first element is node
                if (isNode(obj[0])) {
                    obj = _slice.call(obj, 0);
                }
                if ($.fn.isArray(obj)) {
                    obj.forEach(fn);
                } else if (typeof obj == 'object') {
                    for (p in obj) {
                        if (_hasOwn.call(obj, p)) {
                            v = obj[p];
                            fn(v, p, obj);
                        }
                    }
                } else {
                    console.log('Error: uTools.fn.each - This method only accept array or arraylike and object.');
                }
                return obj;
            }
        });
    }();

    ! function () {
        var INTERVAL = 10;

        function EventWrapper(objs) {
            this.type = 'wrapped';
            this.source = function () {
                if (typeof objs != 'object') {
                    console.log('Warning: EventWrapper - The first parameter must be an array-like.');
                    return;
                }
                // undefined or null
                if (objs.length == null) return [objs];
                if ($.fn.isNumeric(objs.length)) {
                    return _slice.call(objs);
                }
                return [];
            }();
        }
        EventWrapper.prototype = {
            constructor: EventWrapper,
            on: function (type, fn) {
                if (!(this instanceof EventWrapper)) {
                    console.log('Error: EventWrapper.prototype.on - This caller is not EventWrapper instance.');
                }
                $.fn.chunk(this.source, function (itm, idx, arr) {
                    $.ev.on(itm, type, fn);
                }, INTERVAL);
                return this;
            },
            off: function (type, fn) {
                if (!(this instanceof EventWrapper)) {
                    console.log('Error: EventWrapper.prototype.off - This caller is not EventWrapper instance.');
                }
                $.fn.chunk(this.source, function (itm, idx, arr) {
                    $.ev.off(itm, type, fn);
                }, INTERVAL);
                return this;
            }
        };
        $.ev = _create({
            on: $.fn.lazyLoad(
                // typeof domElm.addEventListener == 'function'
                $.fn.lazyLoadAid('addEventListener', 'function'),
                function (obj, type, listener) {
                    obj.addEventListener(type, listener);
                },
                function (obj, type, listener) {
                    obj.attachEvent('on' + type, listener);
                }),
            off: $.fn.lazyLoad(
                // typeof domElm.removeEventListener == 'function'
                $.fn.lazyLoadAid('removeEventListener', 'function'),
                function (obj, type, listener) {
                    obj.removeEventListener(type, listener);
                },
                function (obj, type, listener) {
                    obj.detachEvent('on' + type, listener);
                }),
            // format the event object
            format: function format(event) {
                event = event || window.event;
                event.target || (event.target = event.srcElement);
                if (typeof event.preventDefault != 'function') {
                    event.preventDefault = function (event) {
                        event.returnValue = false;
                    }
                }
                return event;
            },
            // create an EventWrapper instance
            wrp: function wrp(objs) {
                return new EventWrapper(objs);
            }
        });
    }();

    /*************************
    The DOM wrapper for compatibility
     ************************/
    ! function () {
        var INTERVAL = 10; // the chunk traversing delay interval time
        function DOMWrapper(domElms) {
            this.source = function () {
                if (typeof domElms != 'object') {
                    console.log('Warning: DOMWrapper - The first parameter must be an array-like.');
                    return;
                }
                if (!domElms.length) return [domElms];
                return _slice.call(domElms);
            }();
        }
        // prototype inherit the EventWrapper type
        var proto = new $.ev.wrp();
        proto.get = function (idx) {
            if (idx == null) return this.source;
            if (typeof idx == 'number') return this.source[idx];
        };
        // add class on the DOM element
        proto.addClass = function (val) {
            if (typeof val == 'undefined') return;
            var domElms = this.source;
            // internal traversal
            $.fn.chunk(domElms, function (elm) {
                var classList = elm.className.split(' '),
                    classname = classList.join(' ');
                classList.indexOf(val) > -1 ||
                    (classname += ' ' + String(val));
                elm.className = classname.replace(/^\s*|\s*$/, '');
            }, INTERVAL);
            return this;
        };
        // remove class on the DOM element
        proto.removeClass = function (val) {
            if (typeof val == 'undefined') return;
            var domElms = this.source;
            // internal traversal
            $.fn.chunk(domElms, function (elm) {
                var classList = elm.className.split(' '),
                    idx = classList.indexOf(val),
                    removed;
                idx > -1 &&
                    (removed = classList.splice(idx, 1),
                        elm.className = classList.join(' '));
            }, INTERVAL);
            return this;
        };
        // get or set the style sheets in a DOM element
        // support simple arithmetic about size(px/em/%)
        proto.css = function (obj) {
            var p, v, t,
                domElms = this.source;
            // detect null and undefined
            if (obj == null) {
                console.log('Warning: DOMWrapper.prototype.css - The first parameter is null.');
            } else if (typeof obj == 'object') {
                // internal traversal
                $.fn.chunk(domElms, function (elm) {
                    for (p in obj) {
                        if (_hasOwn.call(obj, p)) {
                            v = obj[p];
                            t = typeof v;
                            if (t != 'string' && t != 'number') continue;
                            elm.style[p] = v;
                        }
                    }
                }, INTERVAL);
            }
            return this;
        };

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !               Attention:
        // ! Only process the first element in the wrapper set,
        // ! when you get the value from text, data, atrr and prop
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // argument [val] will not contain leading or heading white space,
        // and <script> or <style> element do not use this method!
        proto.text = $.fn.lazyLoad(
            // typeof domElm.textContent == 'undefined'
            $.fn.lazyLoadAid('textContent', 'undefined'),
            function (val) {
                var domElms = this.source;
                // null and undefined
                if (val == null) {
                    return domElms[0].innerText;
                } else {
                    $.fn.chunk(domElms, function (elm) {
                        elm.innerText = String(val);
                    }, INTERVAL);
                    return this;
                }
            },
            function (val) {
                var domElms = this.source;
                // null and undefined
                if (val == null) {
                    return domElms[0].textContent;
                } else {
                    $.fn.chunk(domElms, function (elm) {
                        elm.textContent = String(val);
                    }, INTERVAL);
                    return this;
                }
            });

        // get or set data of the first DOM element's data attribute in a wrapper set,
        // can choose get pure string or parsed object
        proto.data = $.fn.lazyLoad(
            // typeof domElm.dataset == 'undefined'
            $.fn.lazyLoadAid('dataset', 'undefined'),
            function (name, val, doParse) {
                var domElms = this.source,
                    value;
                // detect null and undefined
                if (name == null) return;
                name = String(name);
                // eliminate the '-*' or '*-' data name
                if (/^-.+|.+-$/g.test(name)) {
                    console.log('Error: DOMWrapper.prototype.data - The leading or trailing dash is not allowed!');
                }
                // process the data name except for 'data-*'
                /^data-.+/.test(name) ||
                    /[^-]-[^-]/.test() ?
                    (name = 'data-' + name) : // prepend 'data-' into the '*-*' data name
                    (name = 'data-' + name.replace(/[A-Z]/g, function (m) {
                        return '-' + m.toLowerCase();
                    }));
                // detect null and undefined
                if (val == null) {
                    value = domElms[0].getAttribute(name);
                    !doParse || (value = JSON.parse(value));
                    return value;
                } else {
                    value = !doParse ? val : JSON.stringify(val);
                    $.fn.chunk(domElms, function (elm) {
                        elm.setAttribute(name, value);
                    }, INTERVAL);
                    return this;
                }
            },
            function (name, val, doParse) {
                var domElms = this.source,
                    value;
                // detect null and undefined
                if (name == null) return;
                name = String(name);
                if (/^-.+|.+-$/g.test(name)) {
                    console.log('Error: DOMWrapper.prototype.data - The leading or trailing dash is not allowed!');
                }
                // process the wrong format of name, like data-at-of-by into atOfBy
                /^data-.+/.test(name) &&
                    (name = name.replace(/^data-/, ''));
                name = name.replace(/-([^-])/g, function (m, p) {
                    return p.toUpperCase();
                });
                // detect null and undefined
                if (val == null) {
                    value = domElms[0].dataset[name];
                    !doParse || (value = JSON.parse(value));
                    return value;
                } else {
                    value = !doParse ? val : JSON.stringify(val);
                    $.fn.chunk(domElms, function (elm) {
                        elm.dataset[name] = value;
                    }, INTERVAL);
                    return this;
                }
            });
        // get or set the attribute of the first DOM element in a wrapper set
        proto.attr = function (name, val) {
            var domElms = this.source;
            if (typeof name == 'undefined') return;
            name = String(name);
            // detect null and undefined
            if (val == null) {
                return domElms[0].getAttribute(String(name));
            } else {
                $.fn.chunk(domElms, function (elm) {
                    elm.setAttribute(name, String(val));
                }, INTERVAL);
                return this;
            }
        };
        // get or set the property of the first DOM element in a wrapper set
        proto.prop = function (name, val) {
            var domElms = this.source;
            if (typeof name == 'undefined') return;
            name = String(name);
            // detect null and undefined
            if (val == null) {
                return domElms[0][name];
            } else {
                $.fn.chunk(domElms, function (elm) {
                    elm[name] = val;
                }, INTERVAL);
                return this;
            }
        };
        // DOM node manipulation
        proto.append = function (wrpObj) {
            var parent = this.source[0],
                newChilds = $(wrpObj).source;
            $.fn.chunk(newChilds, function (elm) {
                parent.appendChild(elm);
            }, INTERVAL);
            return this;
        };
        proto.prepend = function (wrpObj) {
            var parent = this.source[0],
                newChilds = $(wrpObj).source;
            $.fn.chunk(newChilds, function (elm) {
                var firstChild = parent.firstChild;
                parent.insertBefore(elm, firstChild);
            }, INTERVAL);
            return this;
        };
        proto.before = function (wrpObj) {
            var newChilds = $(wrpObj).source,
                refChild = this.source[0],
                parent = refChild.parentNode;
            $.fn.chunk(newChilds, function (elm) {
                parent.insertBefore(elm, refChild);
            }, INTERVAL);
            return this;
        }
        proto.after = function (wrpObj) {
            var newChilds = $(wrpObj).source,
                refChild = this.source[0],
                parent = refChild.parentNode,
                nextChild;
            $.fn.chunk(newChilds, function (elm) {
                if (refChild == parent.lastChild) {
                    parent.appendChild(elm);
                } else {
                    nextChild = refChild.nextSibling;
                    parent.insertBefore(elm, nextChild);
                }
            }, INTERVAL);
            return this;
        }
        proto.appendTo = function (wrpObj) {
            $(wrpObj).append(this);
            return this;
        };
        proto.prependTo = function (wrpObj) {
            $(wrpObj).prepend(this);
            return this;
        };
        proto.insertBefore = function (wrpObj) {
            $(wrpObj).before(this);
            return this;
        };
        proto.insertAfter = function (wrpObj) {
            $(wrpObj).after(this);
            return this;
        };
        DOMWrapper.prototype = proto;
        proto = null;
        $.dom = _create({
            /****************** compatible tools ********************/
            getWinWidth: $.fn.lazyLoad(typeof global.innerWidth == 'number', function () {
                    return global.innerWidth;
                },
                function () {
                    return document.body.clientWidth || document.documentElement.clientWidth
                }),
            // get computed style in a DOM element
            getStyle: $.fn.lazyLoad(function () {
                return typeof global.getComputedStyle == 'function';
            }, function (domElm) {
                return global.getComputedStyle(domElm);
            }, function (domElm) {
                return domElm.currentStyle;
            }),
            getElms: function (parent, selector) {
                return _slice.call(parent.querySelectorAll(selector));
            },
            getRules: function (sheet) {
                return sheet.cssRules || sheet.rules;
            },
            wrp: function (objs) {
                return new DOMWrapper(objs);
            }
        });
    }();

    /*************************
    The Promise
    source: https://www.promisejs.org/implementing/
     *************************/
    ! function ($) {
        var PENDING = 0,
            FULFILLED = 1,
            REJECTED = 2;

        function Promise(fn) {
            // store state which can be PENDING, FULFILLED or REJECTED
            var state = PENDING;
            // store value once FULFILLED or REJECTED
            var value = null;
            // store success and failure handlers
            var handlers = [];

            function getThen(value) {
                var t = typeof value,
                    then;
                if (value && (t == 'object' || t == 'function')) {
                    then = value.then;
                    if (typeof then == 'function') {
                        return then;
                    }
                }
                return null;
            }

            function doResolve(fn, onFulfilled, onRejected) {
                var done = false;
                try {
                    fn(function (value) {
                        if (done) return;
                        done = true;
                        onFulfilled(value);
                    }, function (reason) {
                        if (done) return;
                        done = true;
                        onRejected(reason);
                    });
                } catch (e) {
                    if (done) return;
                    done = true;
                    onRejected(e);
                }
            }

            function fulfill(result) {
                state = FULFILLED;
                value = result;
                handlers.forEach(handle);
                handlers = null;
            }

            function reject(error) {
                state = REJECTED;
                value = error;
                handlers.forEach(handle);
                handlers = null;
            }

            function resolve(result) {
                try {
                    var then = getThen(result);
                    if (then) {
                        doResolve(then.bind(result), resolve, reject);
                        return;
                    }
                    fulfill(result);
                } catch (e) {
                    reject(e);
                }
            }

            function handle(handler) {
                if (state === PENDING) {
                    handlers.push(handler);
                } else {
                    if (state === FULFILLED && typeof handler.onFulfilled == 'function') {
                        handler.onFulfilled(value);
                    }
                    if (state === REJECTED && typeof handler.onRejected == 'function') {
                        handler.onRejected(value);
                    }
                }
            }
            this.done = function (onFulfilled, onRejected) {
                // wait for vacant of thread
                setTimeout(function () {
                    handle({
                        onFulfilled: onFulfilled,
                        onRejected: onRejected
                    });
                }, 0);
            };
            this.then = function (onFulfilled, onRejected) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    return self.done(function (result) {
                        if (typeof onFulfilled == 'function') {
                            try {
                                return resolve(onFulfilled(result));
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            return resolve(result);
                        }
                    }, function (error) {
                        if (typeof onRejected == 'function') {
                            try {
                                return resolve(onRejected(error));
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            return reject(error);
                        }
                    });
                })
            };
            doResolve(fn, resolve, reject);
        }
        $.Promise = Promise;
    }(uTools);
}(uTools, window || self);
