var d = {
    _isDeferred: function (A) {
        var B = $.isFunction;
        return A && B(A.success) && B(A.then) && B(A.fail) && B(A.cancel);
    },
    Deferred: function () {
        var A = this; baidu.extend(A, {
            _fired: 0,
            _firing: 0,
            _cancelled: 0,
            _resolveChain: [],
            _rejectChain: [],
            _result: [],
            _isError: 0
        }); function B() {
            if (A._cancelled || A._firing) {
                return;
            } if (A._nextDeferred) {
                A._nextDeferred.then(A._resolveChain[0], A._rejectChain[0]); return;
            } A._firing = 1; var C = A._isError ? A._rejectChain : A._resolveChain, F = A._result[A._isError ? 1 : 0]; while (C[0] && !A._cancelled) {
                try {
                    var E = C.shift().call(A, F); if (baidu.async._isDeferred(E)) {
                        A._nextDeferred = E; [].push.apply(E._resolveChain, A._resolveChain); [].push.apply(E._rejectChain, A._rejectChain); C = A._resolveChain = []; A._rejectChain = [];
                    }
                } catch (D) {
                    throw D;
                } finally {
                    A._fired = 1; A._firing = 0;
                }
            }
        } A.resolve = A.fireSuccess = function (C) {
            A._result[0] = C;B();return A;
        }; A.reject = A.fireFail = function (C) {
            A._result[1] = C;A._isError = 1;B();return A;
        }; A.then = function (D, C) {
            A._resolveChain.push(D);A._rejectChain.push(C);if (A._fired) {
                B();
            }return A;
        }; A.success = function (C) {
            return A.then(C, baidu.fn.blank);
        }; A.fail = function (C) {
            return A.then(baidu.fn.blank, C);
        }; A.cancel = function () {
            A._cancelled = 1;
        };
    },
    get: function (A) {
        var B = new baidu.async.Deferred; baidu.ajax.request(A, {
            onsuccess: function (C, D) {
                B.resolve({
                    xhr: C,
                    responseText: D
                });
            },
            onfailure: function (C) {
                B.reject({
                    xhr: C
                });
            }
        }); return B;
    },
    post: function (A, C) {
        var B = new baidu.async.Deferred; baidu.ajax.request(A, {
            method: "POST",
            data: C,
            onsuccess: function (D, E) {
                B.resolve({
                    xhr: D,
                    responseText: E
                });
            },
            onfailure: function (D) {
                B.reject({
                    xhr: D
                });
            }
        }); return B;
    },
    when: function (D, A, C) {
        if (baidu.async._isDeferred(D)) {
            D.then(A, C); return D;
        } var B = new baidu.async.Deferred; B.then(A, C).resolve(D); return B;
    }
}
Promise = function A() {
    this.result = [];
    this.failResult = [];
    this.status = 0;
    this.resolveQuery = [];
    this.beforeQuery = [];
    this.afterQuery = [];
    this.rejectQuery = [];
    this.resultCache = [];
    this.resultCount = 0;
    this.returnCount = 0;
}
//http://yuedu.baidu.com/book/view/7f01e0bce83788bb422f74c1.html 百度阅读
Promise.prototype = {
    empty: function () { },
    any: function () {
        this.returnCount = 1;
    },
    some: function (B) {
        this.returnCount = Math.min(B, this.resultCount);
    },
    all: function () {
        this.returnCount = this.resultCount;
    },
    when: function () {
        var B = arguments; this.resultCount = this.returnCount = arguments.length; var D = 0; var F = this; function H(J) {
            return function (K) {
                F.resultCache[J] = K;if (++D == F.returnCount) {
                    F.resolve();
                }
            };
        } for (var E = 0, C = B.length; E < C; E++) {
            var I = B[E]; if (typeof I === "function") {
                H(E)(I());
            } if (I instanceof A) {
                I.then(H(E), this.reject);
            } if (typeof I == "string" || typeof I == "array") {
                if (typeof I == "string") {
                    I = [I];
                } baidu.lang.eventCenter.when(I).then(H(E));
            }
        } return this;
    },
    then: function (C, B) {
        C = C || this.empty; B = B || this.empty; this.resolveQuery.push(C); this.rejectQuery.push(B); if (this.status == 1) {
            this.resolve();
        } if (this.status == 2) {
            this.reject();
        } return this;
    },
    before: function (B) {
        this.beforeQuery.push(B); return this;
    },
    after: function (B) {
        this.afterQuery.push(B); return this;
    },
    resolve: function () {
        if (arguments.length > 0) {
            this.resultCache = this.result = Array.prototype.slice.call(arguments, 0);
        } else {
            this.result = this.resultCache;
        } this.status = 1; var C = this; function B(F) {
            for (var E = 0, D = F.length; E < D; E++) {
                F[E].apply(C, C.result);
            } F.length = 0;
        } B(this.beforeQuery); B(this.resolveQuery); B(this.afterQuery); return this;
    },
    reject: function () {
        this.status = 0; for (var C = 0, B = this.rejectQuery.length; C < B; C++) {
            this.rejectQuery[C].apply(this, this.failResult);
        } return this;
    },
    isPromise: true
}
var eventCenter = {
    guid : TANGRAM__2,
    when : function () { 
        var C = new Z.promise; var B = []; baidu.each(arguments, function (E, D) {
            typeof E == "string" && (E = [E]);var F = A.fire.apply(A, E);B.push(F);
        }); return C.when.apply(C, B);
    },
    on : function (D, E, A) {
        if (!baidu.lang.isFunction(E)) {
            return;
        } !this.__listeners && (this.__listeners = {}); var B = this.__listeners, C; if (typeof A == "string" && A) {
            if (/[^\w\-]/.test(A)) {
                throw "nonstandard key:" + A;
            } else {
                E.hashCode = A; C = A;
            }
        } D.indexOf("on") != 0 && (D = "on" + D); typeof B[D] != "object" && (B[D] = {}); C = C || baidu.lang.guid(); E.hashCode = C; B[D][C] = E;
    },
    un : function (C, D) {
        if (typeof D != "undefined") {
            if (baidu.lang.isFunction(D) && !(D = D.hashCode) || !baidu.lang.isString(D)) {
                return;
            }
        } !this.__listeners && (this.__listeners = {}); C.indexOf("on") != 0 && (C = "on" + C); var A = this.__listeners; if (!A[C]) {
            return;
        } if (typeof D != "undefined") {
            A[C][D] && delete A[C][D];
        } else {
            for (var B in A[C]) {
                delete A[C][B];
            }
        }
    },
    fire : function () {
        var B = Array.prototype.slice.call(arguments, 1); var C = arguments[0]; if (baidu.lang.isString(C)) {
            C = new baidu.lang.Event(C);
        } C.promise = new Z.promise; B.unshift(C); A.dispatchEvent.apply(A, B); return C.promise;
    },
    proxy : function (C, B, D) {
        if (arguments.length == 2) {
            D = B; B = {};
        } A.fire(C, B).then(D);
    },
    __listeners : "object Object",
    dispose : function () {
        delete window[baidu.guid]._instances[this.guid]; for (var A in this) {
            if (!baidu.lang.isFunction(this[A])) {
                delete this[A];
            }
        } this.disposed = true;
    },
    toString : function () {
        return "[object " + (this._className || "Object") + "]";
    },
    addEventListener : function (D, E, A) {
        if (!baidu.lang.isFunction(E)) {
            return;
        } !this.__listeners && (this.__listeners = {}); var B = this.__listeners, C; if (typeof A == "string" && A) {
            if (/[^\w\-]/.test(A)) {
                throw "nonstandard key:" + A;
            } else {
                E.hashCode = A; C = A;
            }
        } D.indexOf("on") != 0 && (D = "on" + D); typeof B[D] != "object" && (B[D] = {}); C = C || baidu.lang.guid(); E.hashCode = C; B[D][C] = E;
    },
    removeEventListener : function (C, D) {
        if (typeof D != "undefined") {
            if (baidu.lang.isFunction(D) && !(D = D.hashCode) || !baidu.lang.isString(D)) {
                return;
            }
        } !this.__listeners && (this.__listeners = {}); C.indexOf("on") != 0 && (C = "on" + C); var A = this.__listeners; if (!A[C]) {
            return;
        } if (typeof D != "undefined") {
            A[C][D] && delete A[C][D];
        } else {
            for (var B in A[C]) {
                delete A[C][B];
            }
        }
    },
    dispatchEvent : function (D, B) {
        if (baidu.lang.isString(D)) {
            D = new baidu.lang.Event(D);
        } !this.__listeners && (this.__listeners = {}); B = B || {}; for (var E in B) {
            D[E] = B[E];
        } var E, A = this.__listeners, C = D.type; D.target = D.target || this; D.currentTarget = this; C.indexOf("on") != 0 && (C = "on" + C); baidu.lang.isFunction(this[C]) && this[C].apply(this, arguments); if (typeof A[C] == "object") {
            for (E in A[C]) {
                A[C][E].apply(this, arguments);
            }
        } return D.returnValue;
    },
    addEventListeners : function (E, D) {
        if (typeof D == "undefined") {
            for (var A in E) {
                this.addEventListener(A, E[A]);
            }
        } else {
            E = E.split(","); var A = 0, B = E.length, C; for (; A < B; A++) {
                this.addEventListener(baidu.trim(E[A]), D);
            }
        }
    },
    once : function (C, F, B) {
        var E = this; function D(H) {
            F.apply(E, arguments); E.removeEventListener(C, D, B);
        } this.addEventListener(C, D, B);
    }
}