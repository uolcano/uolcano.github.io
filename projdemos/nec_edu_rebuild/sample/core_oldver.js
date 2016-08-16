var uTools = {};
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
                    throw new TypeError('Argument must be an object, or null');
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
                throw new TypeError('what is trying to be bound is not callable.')
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
    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function (fn) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                throw new TypeError('Argument must be an array!');
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
                throw new TypeError('Argument must be an array!');
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


/******************************
    Common tool set
 ******************************/
! function ($, global) {
    var hasOwn = Object.prototype.hasOwnProperty,
        getOwns = Object.getOwnPropertyNames,
        slice = Array.prototype.slice;
    /****************** detector *************/
    function getTypeOf(obj) {
        var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
        if (type != 'object') return type;
        if (obj.constructor &&
            !hasOwn.call(obj, 'constructor') &&
            !hasOwn.call(obj, 'isPrototypeOf')) {
            return obj.constructor.toString().match(/function\s*([^\(\s]*)/)[1].toLowerCase();
        }
    }
    // return true if it is a array
    function isArray(obj) {
        return getTypeOf(obj) == 'array';
    }
    // return true if it is a DOM node
    function isNode(obj) {
        return typeof Node == 'object' ? obj instanceof Node :
            obj && typeof obj == 'object' && typeof obj.nodeType == 'number' && typeof obj.nodeName == 'string'
    }
    // return true if it is a DOM element
    function isElement(obj) {
        return typeof HTMLElement == 'object' ? obj instanceof HTMLElement :
            obj && typeof obj == 'object' && obj != null && obj.nodeType === 1 && typeof obj.nodeName == 'string';
    }
    // detect IE or IE version
    function isIE(ver) {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->';
        return b.getElementsByTagName('i').length === 1;
    };

    /***************** performance optimization ******************/
    // lazy load some compatibly choosing function
    // @param {boolean|function} [determine condition]
    // @param {fn1}              [callback if expr is true]
    // @param {fn2}              [callback if expr is false]
    function lazyLoad(expr, fn1, fn2) {
        if (typeof fn1 != 'function') {
            throw new ReferenceError('The second parameter must be a function to be returned.');
        }
        if (typeof fn2 != 'function') {
            throw new ReferenceError('The third parameter must be a function to be returned.');
        }
        if (typeof expr == 'boolean') {
            return expr ? fn1 : fn2;
        } else if (typeof expr == 'function') {
            return expr() ? fn1 : fn2;
        } else {
            throw new new TypeError('The first parameter should be a boolean or function to be called.');
        }
    }
    // array chunk traversing auxiliary method
    // @param {number}   [interval time]
    // @param {array}    [array to traverse]
    // @param {function} [callback]
    // @param {object}   [bound context]
    function chunk(intv, arr, fn, ctx) {
        var copy = arr.slice(),
            idx = 0;
        setTimeout(function f() {
            var item = copy.shift();
            fn.call(ctx, item, idx++, copy);
            if (copy.length > 0) {
                setTimeout(f, intv);
            }
        }, 0);
    }
    // frequently process throttle method
    // @param {number}   [interval time]
    // @param {function} [callback]
    // @param {object}   [bound context]
    function throttle(intv, fn, ctx) {
        clearTimeout(fn.tId);
        fn.tId = setTimeout(function () {
            fn.call(ctx);
        }, intv);
    }
    /****************** compatible tools ********************/
    var getWinWidth = function () {
        return lazyLoad(typeof global.innerWidth == 'number', function () {
                return global.innerWidth;
            },
            function () {
                return document.body.clientWidth || document.documentElement.clientWidth
            });
    }();
    var getElms = function (parent, selector) {
        return slice.call(parent.querySelectorAll(selector));
    };
    // get computed style in a DOM element
    var getStyle = function () {
        return lazyLoad(function () {
            return typeof global.getComputedStyle == 'function';
        }, function (domElm) {
            return global.getComputedStyle(domElm);
        }, function (domElm) {
            return domElm.currentStyle;
        });
    }();
    var getRules = function (sheet) {
        return sheet.cssRules || sheet.rules;
    }
    var hasPrototypeProperty = function (obj, name) {
        return !hasOwn.call(obj) && (name in obj);
    };

    function each(obj, fn) {
        var p, v;
        // convert NodeList into array if the first element is node
        if (isNode(obj[0])) {
            obj = slice.call(obj, 0);
        }
        if (isArray(obj)) {
            obj.forEach(fn);
        } else if (typeof obj == 'object') {
            for (p in obj) {
                if (hasOwn.call(obj, p)) {
                    v = obj[p];
                    fn(v, p, obj);
                }
            }
        } else {
            throw new TypeError('This method only accept array or arraylike and object.');
        }
        return obj;
    }
    $.fn = Object.create({
        name: 'generic tools',
        getTypeOf: getTypeOf,
        isArray: isArray,
        isNode: isNode,
        isElement: isElement,
        isIE: isIE,
        hasPrototypeProperty: hasPrototypeProperty,
        lazyLoad: lazyLoad,
        chunk: chunk,
        throttle: throttle,
        each: each,
        getWinWidth: getWinWidth,
        getStyle: getStyle,
        getRules: getRules,
        getElms: getElms
    });
    global._uTools = global.$ = global._$ = $;
}(uTools, window || self);

/**********************
The event wrapper for compatibility
 *********************/
! function ($) {
    function EventWrapper(obj) {
        this.handlers = {};
        this.source = obj;
    }

    function preventDefault() {
        this.preventDefault ?
            this.preventDefault() :
            this.returnValue = false;
    };
    EventWrapper.prototype = {
        constructor: EventWrapper,
        fire: function () {},
        on: function (type, handler) {
            if (!(this instanceof EventWrapper)) {
                throw TypeError('This object is not EventWrapper instance.');
            }
            if (typeof this.handlers[type] == 'undefined') {
                this.handlers[type] = [];
                this.fire = this.trigger.bind(this);
                this.source.addEventListener ?
                    this.source.addEventListener(type, this.fire) :
                    this.source.attachEvent('on' + type, this.fire);
            }
            this.handlers[type].push(handler);
            return this;
        },
        off: function (type, handler) {
            var idx = -1;
            if (!(this instanceof EventWrapper)) {
                throw TypeError('This object is not EventWrapper instance.');
            }
            if (typeof this.handlers[type] == 'undefined') {
                console.log('This handler had not been added.');
            } else {
                idx = this.handlers[type].indexOf(handler);
                this.handlers[type].splice(idx, 1);
            }
            if (!this.handlers[type].length) {
                this.removeAll(type);
            }
            return this;
        },
        removeAll: function (type) {
            this.source.removeEventListener ?
                this.source.removeEventListener(type, this.fire) :
                this.source.detachEvent('on' + type, this.fire);
            return this;
        },
        // can be extended to accept second argument,
        // can only trigger handlers, while not trigger event
        trigger: function (event) {
            event = event || window.event;
            event.target || (event.target = event.srcElement);
            event.preventDefault = preventDefault;
            this.handlers[event.type]
                .forEach(function (item) {
                    item(event);
                });
            return this;
        }
    };
    $.EventWrapper = EventWrapper;
}(uTools);


/*************************
The DOM wrapper for compatibility
 ************************/
! function ($) {
    var hasOwn = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice;

    function DOMWrapper(domElm) {
        this.source = domElm;
    }
    var proto = new $.EventWrapper();
    // add class on the DOM element
    proto.addClass = function (val) {
        if (typeof val == 'undefined') return;
        var domElm = this.source,
            classList = domElm.className.split(' ');
        classList.indexOf(val) > -1 ||
            (domElm.className += ' ' + String(val));
        return this;
    };
    // remove class on the DOM element
    proto.removeClass = function (val) {
        if (typeof val == 'undefined') return;
        var domElm = this.source,
            classList = domElm.className.split(' '),
            idx = classList.indexOf(val),
            removed;
        idx > -1 &&
            (removed = classList.splice(idx, 1),
                domElm.className = classList.join(' '));
        return this;
    };
    // argument [val] will not contain leading or heading white space,
    // and <script> or <style> element do not use this method!
    proto.text = $.fn.lazyLoad(function () {
            var b = document.createElement('b'),
                t = typeof b.textContent == 'undefined';
            b = null;
            return t;
        }, function (val) {
            var domElm = this.source,
                value = val == null ?
                domElm.innerText :
                (domElm.innerText = String(val));
            return value;
        },
        function (val) {
            var domElm = this.source,
                value = val == null ?
                domElm.textContent :
                (domElm.textContent = String(val));
            return value;
        });
    // get or set data in a DOM element's data attribute,
    // can choose get string or parsed object
    proto.data = $.fn.lazyLoad(function () {
        var b = document.createElement('b'),
            t = typeof b.dataset == 'undefined';
        b = null;
        return t;
    }, function (name, val, dontParse) {
        var domElm = this.source,
            value;
        // detect null and undefined
        if (name == null) return;
        name = String(name);
        // eliminate the '-*' or '*-' data name
        if (/^-.+|.+-$/g.test(name)) {
            throw SyntaxError('The leading or trailing dash not allowed!');
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
            value = domElm.getAttribute(name);
            dontParse || (value = JSON.parse(value));
        } else {
            value = dontParse ? val : JSON.stringify(val);
            domElm.setAttribute(name, value);
        }
        return value;
    }, function (name, val, dontParse) {
        var domElm = this.source,
            value;
        // detect null and undefined
        if (name == null) return;
        name = String(name);
        if (/^-.+|.+-$/g.test(name)) {
            throw SyntaxError('The leading or trailing dash not allowed!');
        }
        // process the wrong format of name, like data-at-of-by into atOfBy
        /^data-.+/.test(name) &&
            (name = name.replace(/^data-/, ''));
        name = name.replace(/-([^-])/g, function (m, p) {
            return p.toUpperCase();
        });
        // detect null and undefined
        if (val == null) {
            value = domElm.dataset[name];
            dontParse || (value = JSON.parse(value));
        } else {
            value = dontParse ? val : JSON.stringify(val);
            domElm.dataset[name] = value;
        }
        return value;
    });
    // get or set the attribute of a DOM element
    proto.attr = function (name, val) {
        var value,
            domElm = this.source;
        if (typeof name == 'undefined') return;
        name = String(name);
        // detect null and undefined
        val == null ?
            (value = domElm.getAttribute(String(name))) :
            (value = String(val),
                domElm.setAttribute(name, value));
        return value;
    };
    // get or set the property of a DOM element
    proto.prop = function (name, val) {
        var value,
            domElm = this.source;
        if (typeof name == 'undefined') return;
        name = String(name);
        // detect null and undefined
        val == null ?
            (value = domElm[name]) :
            (value = String(val),
                domElm[name] = value);
        return value;
    };
    // get or set the style sheets in a DOM element
    // support simple arithmetic about size(px/em/%)
    proto.css = function (obj) {
        var p, v, s, f, mv, ms,
            domElm = this.source,
            reg1 = /([\+\-\*\/])([\d\.]*)(px|em|%)?/,
            reg2 = /([\d\.]*)px/;
        // detect null and undefined
        if (obj == null)
            return $.fn.getStyle(domElm);
        if (typeof obj == 'object') {
            for (p in obj) {
                if (hasOwn.call(obj, p)) {
                    v = obj[p];
                    if (typeof v != 'string') continue;
                    mv = v.match(reg1);
                    // need for arithmetic computation
                    if (mv && mv[0].length == v.length && mv[1]) {
                        s = $.fn.getStyle(domElm);
                        // base value used to evaluate the relative value setting
                        // em can not work in IE 8,
                        // because of IE8's computed font-size is measured in em.
                        f = parseFloat(s.fontSize);
                        // the computed styles contain the prop
                        if (ms = s[p].match(reg2)) {
                            switch (mv[3]) {
                            case 'em':
                                v = eval((+mv[2] * f) + mv[1] + ms[1]);
                                break;
                            case '%':
                                v = eval((+mv[2] / 100 * ms[1]) + mv[1] + ms[1]);
                                break;
                            default: // deal with px and pure numbr in the indentical
                                v = eval(mv[2] + mv[1] + ms[1]);
                                break;
                            }
                        } else {
                            continue;
                        }
                        v += 'px';
                    }
                    domElm.style[p] = v;
                }
            }
        }
        return this;
    };
    proto.append = function (wrpObj) {
        var parent = this.source,
            newChild = wrpObj.source;
        parent.appendChild(newChild);
        return this;
    };
    proto.prepend = function (wrpObj) {
        var parent = this.source,
            newChild = wrpObj.source,
            firstChild = parent.firstChild;
        parent.insertBefore(newChild, firstChild);
        return this;
    };
    proto.before = function (wrpObj) {
        var newChild = wrpObj.source,
            refChild = this.source,
            parent = refChild.parentNode;
        parent.insertBefore(newChild, refChild);
        return this;
    }
    proto.after = function (wrpObj) {
        var newChild = wrpObj.source,
            refChild = this.source,
            parent = refChild.parentNode,
            nextChild;
        if (refChild == parent.lastChild) {
            parent.appendChild(newChild);
        } else {
            nextChild = refChild.nextSibling;
            parent.insertBefore(newChild, nextChild);
        }
        return this;
    }
    proto.appendTo = function (wrpObj) {
        wrpObj.append(this);
        return this;
    };
    proto.prependTo = function (wrpObj) {
        wrpObj.prepend(this);
        return this;
    };
    proto.insertBefore = function (wrpObj) {
        wrpObj.before(this);
        return this;
    };
    proto.insertAfter = function (wrpObj) {
        wrpObj.after(this);
        return this;
    };
    DOMWrapper.prototype = proto;
    proto = null;
    $.DOMWrapper = DOMWrapper;
}(uTools);

// create a wrapped object
! function ($) {
    var slice = Array.prototype.slice;
    $.wrp = function (obj) {
        // detect whether create DOM elements
        var m, docFrag, tmpDiv,
            reg1 = /^\s*\<([\d\w]+)[\s\S]*\>[\s\S]*\<\/\1\>\s*$/, // complete tag
            reg2 = /^\s*\<([\d\w]+)[^\<\>]*\/\>\s*$/; // self-closed tag
        if ($.fn.isNode(obj)) {
            return new $.DOMWrapper(obj);
        } else if (typeof obj == 'object') {
            return new $.EventWrapper(obj);
        } else if (typeof obj == 'string') {
            m = obj.match(reg1) || obj.match(reg2);
            console.log('To creat a ' + m[1] + ' element');
            if (m) {
                docFrag = document.createDocumentFragment();
                tmpDiv = document.createElement('div');
                tmpDiv.innerHTML = obj;
                $.fn.each(tmpDiv.childNodes, function (child) {
                    if (child.nodeType === 1) {
                        docFrag.appendChild(child);
                    }
                });
                tmpDiv = null;
                return $.wrp(docFrag);
            } else {
                slice.call(parent.querySelectorAll(obj));
            }
        }
        throw new TypeError('The parameter should be an object or DOM element.');
    }
}(uTools);

/*****************
cookies method set
 *****************/
! function ($) {
    $.cookies = {
        get: function (name) {
            var cookies = document.cookie,
                name = encodeURIComponent(name) + '=',
                start = cookies.indexOf(name),
                end = null,
                value = null;
            if (start > -1) {
                end = cookies.indexOf('; ', start);
                end === -1 && (end = cookies.length);
                value = decodeURIComponent(cookies.slice(start, end));
            }
            return value;
        },
        set: function (name, value, maxAge, path, domain, secure) {
            var cookie = '';
            if (typeof name == 'undefined' || typeof value == 'undefined')
                throw Error('The name and value must be defined.');
            cookie += encodeURIComponent(String(name)) +
                '=' + encodeURIComponent(String(value));
            typeof maxAge == 'number' &&
                cookie += '; max-age=' + maxAge;
            typeof path == 'string' && cookie += '; path=' + path;
            typeof domain == 'string' && cookie += '; domain=' + domain;
            typeof secure == 'boolean' && cookie += '; secure';
            document.cookie = cookie;
        },
        unset: function (name, path, domain, secure) {
            this.set(name, '', +new Date(), path, domain, secure);
        }
    };
}(uTools);

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

/************************
    Ajax communication
 ***********************/
! function ($) {
    function serialize(dataObj) {
        var n, v,
            pairs = [];
        // process null or undefined
        if (dataObj == null) return '';
        for (p in dataObj) {
            v = dataObj[p];
            if (!dataObj.hasOwnProperty(p) ||
                typeof v == 'function' ||
                typeof v == 'object') {
                continue;
            }
            v = v.toString();
            n = encodeURIComponent(p);
            v = encodeURIComponent(v);
            pairs.push(n + '=' + v);
        }
        return pairs.join('&');
    }
    // Ajax encapsulation
    // @param {string} [url]
    // @param {object} [opt]
    // opt: {
    //   method: {sring},
    //   success: {function},
    //   fail: {function},
    //   data: {object},
    //   otherfields
    // }
    function ajax(url, opt) {
        var xhr, queryUri, method, success, fail, data;
        var err = false;
        if (opt && typeof opt == 'object') {
            if (typeof opt.success == 'function') {
                success = opt.success;
                delete opt.success || (err = true);
            }
            if (typeof opt.fail == 'function') {
                fail = opt.fail;
                delete opt.fail || (err = true);
            }
            if (typeof opt.method == 'string') {
                switch (opt.method.toLowerCase()) {
                case 'get':
                case 'post':
                    method = opt.method;
                    delete opt.method || (err = true);
                    break;
                }
            }
            // opt.data must be a plain object
            if (typeof opt.data == 'object' &&
                opt.data.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
                data = opt.data;
                delete opt.data || (err = true);
            }
        }
        if (err) return new $.Promise(function (resolve, reject) {
            reject('The second parameter passed into contains some properties undeletable.');
        });
        opt = serialize(opt);
        queryUri = url + (opt && opt.length > 0 ?
            '?' + opt : '');
        console.log(queryUri)
        try {
            xhr = new XMLHttpRequest();
            xhr.open(method, queryUri);
        } catch (e) {
            try {
                xhr = new XDomainRequest();
                xhr.open(method, queryUri);
            } catch (e) {
                throw new Error('Browser not support Cross-Origin Resource Sharing.');
            }
        }
        if (xhr) {
            return new $.Promise(function (resolve, reject) {
                xhr.onload = function () {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        success && success(xhr);
                        resolve(xhr);
                    } else {
                        fail && fail(xhr);
                        reject(xhr);
                    }
                };
                xhr.onerror = function () {
                    fail && fail(xhr);
                    reject(xhr);
                }
                xhr.send(null);
            });
        }
        return new $.Promise(function (resolve, reject) {
            reject('Create XMLHttpRquest failed.');
        });
    }
    $.ajax = ajax;
}(uTools);

/**************************************
    The template parser
 **************************************/
! function ($) {
    /* body... */
}(uTools);
// var reg = /^\s*(\<([\d\w]+?)([\s\S]*)\>)[\s\S]*(\<\/\2\>)\s*$/;
