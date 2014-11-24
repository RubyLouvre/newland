(function(DOC) {

    var expose = Date.now()
    var subscribers = "$" + expose
    //http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript
    var window = Function("return this")()
    var otherRequire = window.require
    var otherDefine = window.define
    var stopRepeatAssign = false
    var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
    var rcomplexType = /^(?:object|array)$/
    var rsvg = /^\[object SVG\w*Element\]$/
    var rwindow = /^\[object (Window|DOMWindow|global)\]$/
    var oproto = Object.prototype
    var ohasOwn = oproto.hasOwnProperty
    var serialize = oproto.toString
    var ap = Array.prototype
    var aslice = ap.slice
    var Registry = {} //将函数曝光到此对象上，方便访问器收集依赖
    var head = DOC.head //HEAD元素
    var root = DOC.documentElement
    var hyperspace = DOC.createDocumentFragment()
    var cinerator = DOC.createElement("div")
    var class2type = {}
    "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function(name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    })

    function noop() {
    }

    function log() {
        if (avalon.config.debug) {
// http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
            console.log.apply(console, arguments)
        }
    }
    function oneObject(array, val) {
        if (typeof array === "string") {
            array = array.match(rword) || []
        }
        var result = {},
                value = val !== void 0 ? val : 1
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value
        }
        return result
    }
    /*生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript*/
    function generateID() {
        return "avalon" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
    /*********************************************************************
     *                  avalon的静态方法定义区                                   *
     **********************************************************************/
    window.avalon = function(el) { //创建jQuery式的无new 实例化结构
        return new avalon.init(el)
    }
    avalon.init = function(el) {
        this[0] = this.element = el
    }
    avalon.fn = avalon.prototype = avalon.init.prototype
    avalon.isFunction = isFunction
    function isFunction(fn) {
        return typeof fn === "function"
    }
    /*取得目标类型*/
    avalon.type = function(obj) {
        if (obj == null) {
            return String(obj)
        }
// 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === "object" || typeof obj === "function" ?
                class2type[serialize.call(obj)] || "object" :
                typeof obj
    }

    avalon.isWindow = function(obj) {
        return rwindow.test(serialize.call(obj))
    }

    /*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
    avalon.isPlainObject = function(obj) {
        return !!obj && typeof obj === "object" && Object.getPrototypeOf(obj) === oproto
    }

    avalon.mix = avalon.fn.mix = function() {
        var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false

        // 如果第一个参数为布尔,判定是否深拷贝
        if (typeof target === "boolean") {
            deep = target
            target = arguments[1] || {}
            i++
        }

//确保接受方为一个复杂的数据类型
        if (typeof target !== "object" && avalon.type(target) !== "function") {
            target = {}
        }

//如果只有一个参数，那么新成员添加于mix所在的对象上
        if (i === length) {
            target = this
            i--
        }

        for (; i < length; i++) {
//只处理非空参数
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name]
                    copy = options[name]

                    // 防止环引用
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false
                            clone = src && Array.isArray(src) ? src : []

                        } else {
                            clone = src && avalon.isPlainObject(src) ? src : {}
                        }

                        target[name] = avalon.mix(deep, clone, copy)
                    } else if (copy !== void 0) {
                        target[name] = copy
                    }
                }
            }
        }
        return target
    }

    avalon.mix({
        rword: rword,
        subscribers: subscribers,
        version: 1.36,
        ui: {},
        log: log,
        noop: noop,
        error: function(str, e) { //如果不用Error对象封装一下，str在控制台下可能会乱码
            throw new (e || Error)(str)
        },
        oneObject: oneObject,
        /* avalon.range(10)
         => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
         avalon.range(1, 11)
         => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
         avalon.range(0, 30, 5)
         => [0, 5, 10, 15, 20, 25]
         avalon.range(0, -10, -1)
         => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
         avalon.range(0)
         => []*/
        range: function(start, end, step) { // 用于生成整数数组
            step || (step = 1)
            if (end == null) {
                end = start || 0
                start = 0
            }
            var index = -1,
                    length = Math.max(0, Math.ceil((end - start) / step)),
                    result = Array(length)
            while (++index < length) {
                result[index] = start
                start += step
            }
            return result
        },
        slice: function(nodes, start, end) {
            return aslice.call(nodes, start, end)
        },
        eventHooks: {},
        bind: function(el, type, fn, phase) {
            var hooks = avalon.eventHooks
            var hook = hooks[type]
            if (typeof hook === "object") {
                type = hook.type
                if (hook.deel) {
                    fn = hook.deel(el, fn)
                }
            }
            el.addEventListener(type, fn, !!phase)
            return fn
        },
        unbind: function(el, type, fn, phase) {
            var hooks = avalon.eventHooks
            var hook = hooks[type]
            if (typeof hook === "object") {
                type = hook.type
            }
            el.removeEventListener(type, fn || noop, !!phase)
        },
        css: function(node, name, value) {
            if (node instanceof avalon) {
                node = node[0]
            }
            var prop = /[_-]/.test(name) ? camelize(name) : name
            name = avalon.cssName(prop) || prop
            if (value === void 0 || typeof value === "boolean") { //获取样式
                var fn = cssHooks[prop + ":get"] || cssHooks["@:get"]
                if (name === "background") {
                    name = "backgroundColor"
                }
                var val = fn(node, name)
                return value === true ? parseFloat(val) || 0 : val
            } else if (value === "") { //请除样式
                node.style[name] = ""
            } else { //设置样式
                if (value == null || value !== value) {
                    return
                }
                if (isFinite(value) && !avalon.cssNumber[prop]) {
                    value += "px"
                }
                fn = cssHooks[prop + ":set"] || cssHooks["@:set"]
                fn(node, name, value)
            }
        },
        each: function(obj, fn) {
            if (obj) { //排除null, undefined
                var i = 0
                if (isArrayLike(obj)) {
                    for (var n = obj.length; i < n; i++) {
                        fn(i, obj[i])
                    }
                } else {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            fn(i, obj[i])
                        }
                    }
                }
            }
        },
        getWidgetData: function(elem, prefix) {
            var raw = avalon(elem).data()
            var result = {}
            for (var i in raw) {
                if (i.indexOf(prefix) === 0) {
                    result[i.replace(prefix, "").replace(/\w/, function(a) {
                        return a.toLowerCase()
                    })] = raw[i]
                }
            }
            return result
        },
        parseJSON: JSON.parse,
        Array: {
            /*只有当前数组不存在此元素时只添加它*/
            ensure: function(target, item) {
                if (target.indexOf(item) === -1) {
                    return target.push(item)
                }
            },
            /*移除数组中指定位置的元素，返回布尔表示成功与否*/
            removeAt: function(target, index) {
                return !!target.splice(index, 1).length
            },
            /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
            remove: function(target, item) {
                var index = target.indexOf(item)
                if (~index)
                    return avalon.Array.removeAt(target, index)
                return false
            }
        }
    })


    /*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
    function isArrayLike(obj) {
        if (obj && typeof obj === "object") {
            var n = obj.length,
                    str = serialize.call(obj)
            if (/(Array|List|Collection|Map|Arguments)\]$/.test(str)) {
                return true
            } else if (str === "[object Object]" && (+n === n && !(n % 1) && n >= 0)) {
                return true //由于ecma262v5能修改对象属性的enumerable，因此不能用propertyIsEnumerable来判定了
            }
        }
        return false
    }

    /*视浏览器情况采用最快的异步回调*/
    avalon.nextTick = function(callback) {
        new Promise(function(resolve) {
            resolve()
        }).then(callback)
    }

    if (!root.contains) { //safari5+是把contains方法放在Element.prototype上而不是Node.prototype
        Node.prototype.contains = function(arg) {
            return !!(this.compareDocumentPosition(arg) & 16)
        }
    }
    /*********************************************************************
     *                           modelFactory                              *
     **********************************************************************/
    avalon.vmodels = {}
    avalon.define = function(obj) {
        var id = obj.$id
        if (this.vmodels[id]) {
            log("warning: " + id + " 已经存在于avalon.vmodels中")
        }
        return this.vmodels[id] = modelFactory(obj)
    }
    function isIndex(s) {//判定是非负整数，可以作为索引的
        return +s === s >>> 0;
    }
    function observeCallback(changes) {
        changes.forEach(function(change) {

            if (change.type === "update") {
                var object = change.object
                var name = change.name

                var events = object.$events
                var array = events[name] || []
                var newValue = object[name]
                var newValue = "newValue" in change ? change.newValue : object[name]
                var oldValue = change.oldValue
                var target = "target" in change ? change.target : object
                if (array.length) {
                    //    var newValue = "value" in change ? change.value : object[name]

                    array.forEach(function(fn) {
                        fn.call(target, newValue, oldValue, name)
                    })
                }

                if (Array.isArray(object) && isIndex(name)) {
                    var array = events["[*]"]
                    if (array.length) {

                        var oldValue = change.oldValue
                        array.forEach(function(fn) {
                            fn.call(target, newValue, oldValue, name)
                        })
                    }
                }
                if (object.$parent) {
                    var notifier = Object.getNotifier(object.$parent)
                    if (Array.isArray(object) && isIndex(name)) {
                        notifier.notify({
                            object: object.$parent,
                            type: "update",
                            name: object.$surname + "[" + name + "]",
                            oldValue: oldValue,
                            newValue: newValue,
                            target: target
                        });
                        notifier.notify({
                            object: object.$parent,
                            type: "update",
                            name: object.$surname + "[*]",
                            oldValue: oldValue,
                            newValue: newValue,
                            target: target
                        });
                    } else {
                        //    console.log(newValue)
                        notifier.notify({
                            object: object.$parent,
                            type: "update",
                            name: object.$surname + "." + name,
                            oldValue: oldValue,
                            newValue: newValue,
                            target: target
                        });
                    }
                }
            }
        })
    }
    function isFunction(fn) {
        return typeof fn === "function"
    }
    function isObject(obj) {
        return obj && typeof obj === "object"
    }
    var $$skipArray = String("$id,$surname,$watch,$unwatch,$parent,$fire,$events,$model,$skipArray").match(rword)
    function modelFactory($scope) {
        if (Array.isArray($scope)) {
            //  var arr = $scope.concat()
            //     $scope.length = 0
            var collection = Collection($scope)
            //    collection.pushArray(arr)
            return collection
        }
        $scope.$events = []
        for (var i in EventManager) {
            $scope[i] = EventManager[i]
        }

        for (var i in $scope) {
            if ($$skipArray.indexOf(i) === -1 && isObject($scope[i])) {
                var child = modelFactory($scope[i])
                child.$parent = $scope
                child.$surname = i
                $scope[i] = child
            }
        }
        Object.observe($scope, observeCallback)
        return $scope
    }

    function Collection($scope) {
        $scope.$events = {}
        for (var i in EventManager) {
            $scope[i] = EventManager[i]
        }
        Object.observe($scope, observeCallback)
        return $scope
    }

    var findNode = function(str) {
        return DOC.querySelector(str)
    }
    var EventManager = {
        $watch: function(type, callback) {
            if (typeof callback === "function") {
                console.log(type)
                var callbacks = this.$events[type]
                if (callbacks) {
                    callbacks.push(callback)
                } else {
                    this.$events[type] = [callback]
                }
            } else { //重新开始监听此VM的第一重简单属性的变动
                this.$events = this.$watch.backup
            }
            return this
        },
        $unwatch: function(type, callback) {
            var n = arguments.length
            if (n === 0) { //让此VM的所有$watch回调无效化
                this.$watch.backup = this.$events
                this.$events = {}
            } else if (n === 1) {
                this.$events[type] = []
            } else {
                var callbacks = this.$events[type] || []
                var i = callbacks.length
                while (~--i < 0) {
                    if (callbacks[i] === callback) {
                        return callbacks.splice(i, 1)
                    }
                }
            }
            return this
        },
        $fire: function(type) {
            var special
            if (/^(\w+)!(\S+)$/.test(type)) {
                special = RegExp.$1
                type = RegExp.$2
            }
            var events = this.$events
            var args = aslice.call(arguments, 1)
            var detail = [type].concat(args)
            if (special === "all") {
                for (var i in avalon.vmodels) {
                    var v = avalon.vmodels[i]
                    if (v !== this) {
                        v.$fire.apply(v, detail)
                    }
                }
            } else if (special === "up" || special === "down") {
                var element = events.expr && findNode(events.expr)
                if (!element)
                    return
                for (var i in avalon.vmodels) {
                    var v = avalon.vmodels[i]
                    if (v !== this) {
                        if (v.$events.expr) {
                            var node = findNode(v.$events.expr)
                            if (!node) {
                                continue
                            }
                            var ok = special === "down" ? element.contains(node) : //向下捕获
                                    node.contains(element) //向上冒泡
                            if (ok) {
                                node._avalon = v //符合条件的加一个标识
                            }
                        }
                    }
                }
                var nodes = DOC.getElementsByTagName("*") //实现节点排序
                var alls = []
                Array.prototype.forEach.call(nodes, function(el) {
                    if (el._avalon) {
                        alls.push(el._avalon)
                        el._avalon = ""
                        el.removeAttribute("_avalon")
                    }
                })
                if (special === "up") {
                    alls.reverse()
                }
                for (var i = 0, el; el = alls[i++]; ) {
                    if (el.$fire.apply(el, detail) === false) {
                        break
                    }
                }
            } else {
                var callbacks = events[type] || []
                var all = events.$all || []
                for (var i = 0, callback; callback = callbacks[i++]; ) {
                    if (isFunction(callback))
                        callback.apply(this, args)
                }
                for (var i = 0, callback; callback = all[i++]; ) {
                    if (isFunction(callback))
                        callback.apply(this, arguments)
                }
            }
        }
    }

    /*********************************************************************
     *                       配置模块                                   *
     **********************************************************************/

    function kernel(settings) {
        for (var p in settings) {
            if (!ohasOwn.call(settings, p))
                continue
            var val = settings[p]
            if (typeof kernel.plugins[p] === "function") {
                kernel.plugins[p](val)
            } else if (typeof kernel[p] === "object") {
                avalon.mix(kernel[p], val)
            } else {
                kernel[p] = val
            }
        }
        return this
    }
    var openTag, closeTag, rexpr, rexprg, rbind, rregexp = /[-.*+?^${}()|[\]\/\\]/g
    /*将字符串安全格式化为正则表达式的源码 http://stevenlevithan.com/regex/xregexp/*/
    function escapeRegExp(target) {
        return (target + "").replace(rregexp, "\\$&")
    }
    var innerRequire = noop
    var plugins = {
        loader: function(builtin) {
            window.define = builtin ? innerRequire.define : otherDefine
            window.require = builtin ? innerRequire : otherRequire
        },
        interpolate: function(array) {
            openTag = array[0]
            closeTag = array[1]
            if (openTag === closeTag) {
                avalon.error("openTag!==closeTag", SyntaxError)
            } else if (array + "" === "<!--,-->") {
                kernel.commentInterpolate = true
            } else {
                var test = openTag + "test" + closeTag
                cinerator.innerHTML = test
                if (cinerator.innerHTML !== test && cinerator.innerHTML.indexOf("&lt;") >= 0) {
                    avalon.error("此定界符不合法", SyntaxError)
                }
                cinerator.innerHTML = ""
            }
            var o = escapeRegExp(openTag),
                    c = escapeRegExp(closeTag)
            rexpr = new RegExp(o + "(.*?)" + c)
            rexprg = new RegExp(o + "(.*?)" + c, "g")
            rbind = new RegExp(o + ".*?" + c + "|\\sms-")
        }
    }
    kernel.debug = true
    kernel.plugins = plugins
    kernel.plugins['interpolate'](["{{", "}}"])
    kernel.paths = {}
    kernel.shim = {}
    kernel.maxRepeatSize = 100
    avalon.config = kernel

    /*********************************************************************
     *                           DOM API的高级封装                        *
     **********************************************************************/

    /*转换为连字符线风格*/
    function hyphen(target) {
        return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
    }
    /*转换为驼峰风格*/
    function camelize(target) {
        if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
            return target //提前判断，提高getStyle等的效率
        }
        return target.replace(/[-_][^-_]/g, function(match) {
            return match.charAt(1).toUpperCase()
        })
    }

    "add,remove".replace(rword, function(method) {
        avalon.fn[method + "Class"] = function(cls) {
            var el = this[0]
            //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
            if (cls && typeof cls === "string" && el && el.nodeType === 1) {
                cls.replace(/\S+/g, function(c) {
                    el.classList[method](c)
                })
            }
            return this
        }
    })

    avalon.fn.mix({
        hasClass: function(cls) {
            var el = this[0] || {} //IE10+, chrome8+, firefox3.6+, safari5.1+,opera11.5+支持classList,chrome24+,firefox26+支持classList2.0
            return el.nodeType === 1 && el.classList.contains(cls)
        },
        toggleClass: function(value, stateVal) {
            var node = this[0]
            if (node && node.nodeType === 1) {
                var state = stateVal
                var i = 0
                var classNames = value.split(/\s+/)
                var isBool = typeof stateVal === "boolean"
                var classList = node.classList, className
                while ((className = classNames[i++])) {
                    state = isBool ? state : !classList.contains(className)
                    classList[state ? "add" : "remove"](className)
                }
            }
            return this
        },
        attr: function(name, value) {
            if (arguments.length === 2) {
                this[0].setAttribute(name, value)
                return this
            } else {
                return this[0].getAttribute(name)
            }
        },
        data: function(name, val) {
            var dataset = this[0].dataset
            switch (arguments.length) {
                case 2:
                    dataset[name] = val
                    return this
                case 1:
                    val = dataset[name]
                    return parseData(val)
                case 0:
                    var ret = {}
                    for (var name in dataset) {
                        ret[name] = parseData(dataset[name])
                    }
                    return ret
            }
        },
        removeData: function(name) {
            name = "data-" + hyphen(name)
            this[0].removeAttribute(name)
            return this
        },
        css: function(name, value) {
            if (avalon.isPlainObject(name)) {
                for (var i in name) {
                    avalon.css(this, i, name[i])
                }
            } else {
                var ret = avalon.css(this, name, value)
            }
            return ret !== void 0 ? ret : this
        },
        position: function() {
            var offsetParent, offset,
                    elem = this[0],
                    parentOffset = {
                        top: 0,
                        left: 0
                    };
            if (!elem) {
                return
            }
            if (this.css("position") === "fixed") {
                offset = elem.getBoundingClientRect()
            } else {
                offsetParent = this.offsetParent() //得到真正的offsetParent
                offset = this.offset() // 得到正确的offsetParent
                if (offsetParent[0].tagName !== "HTML") {
                    parentOffset = offsetParent.offset()
                }
                parentOffset.top += avalon.css(offsetParent[0], "borderTopWidth", true)
                parentOffset.left += avalon.css(offsetParent[0], "borderLeftWidth", true)
            }
            return {
                top: offset.top - parentOffset.top - avalon.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - avalon.css(elem, "marginLeft", true)
            }
        },
        offsetParent: function() {
            var offsetParent = this[0].offsetParent || root
            while (offsetParent && (offsetParent.tagName !== "HTML") && avalon.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.offsetParent
            }
            return avalon(offsetParent || root)
        },
        bind: function(type, fn, phase) {
            if (this[0]) { //此方法不会链
                return avalon.bind(this[0], type, fn, phase)
            }
        },
        unbind: function(type, fn, phase) {
            if (this[0]) {
                avalon.unbind(this[0], type, fn, phase)
            }
            return this
        },
        val: function(value) {
            var node = this[0]
            if (node && node.nodeType === 1) {
                var get = arguments.length === 0
                var access = get ? ":get" : ":set"
                var fn = valHooks[getValType(node) + access]
                if (fn) {
                    var val = fn(node, value)
                } else if (get) {
                    return (node.value || "").replace(/\r/g, "")
                } else {
                    node.value = value
                }
            }
            return get ? val : this
        }
    })

    var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/

    function parseData(data) {
        try {
            data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? JSON.parse(data) : data
        } catch (e) {
        }
        return data
    }

    avalon.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(method, prop) {
        avalon.fn[method] = function(val) {
            var node = this[0] || {}, win = getWindow(node),
                    top = method === "scrollTop"
            if (!arguments.length) {
                return win ? win[prop] : node[method]
            } else {
                if (win) {
                    win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop())
                } else {
                    node[method] = val
                }
            }
        }
    })

    function getWindow(node) {
        return node.window && node.document ? node : node.nodeType === 9 ? node.defaultView : false
    }
    //=============================css相关==================================
    var cssHooks = avalon.cssHooks = {}
    var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"]
    var cssMap = {
        "float": "cssFloat"
    }
    avalon.cssNumber = oneObject("columnCount,order,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom")

    avalon.cssName = function(name, host, camelCase) {
        if (cssMap[name]) {
            return cssMap[name]
        }
        host = host || root.style
        for (var i = 0, n = prefixes.length; i < n; i++) {
            camelCase = camelize(prefixes[i] + name)
            if (camelCase in host) {
                return (cssMap[name] = camelCase)
            }
        }
        return null
    }
    cssHooks["@:set"] = function(node, name, value) {
        node.style[name] = value
    }

    cssHooks["@:get"] = function(node, name) {
        if (!node || !node.style) {
            throw new Error("getComputedStyle要求传入一个节点 " + node)
        }
        var ret, computed = getComputedStyle(node, null)
        if (computed) {
            ret = computed[ name ]
            if (ret === "") {
                ret = node.style[name] //其他浏览器需要我们手动取内联样式
            }
        }
        return ret
    }
    cssHooks["opacity:get"] = function(node) {
        var ret = cssHooks["@:get"](node, "opacity")
        return ret === "" ? "1" : ret
    }

    "top,left".replace(rword, function(name) {
        cssHooks[name + ":get"] = function(node) {
            var computed = cssHooks["@:get"](node, name)
            return /px$/.test(computed) ? computed :
                    avalon(node).position()[name] + "px"
        }
    })
    var cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }
    var rdisplayswap = /^(none|table(?!-c[ea]).+)/

    function showHidden(node, array) {
        //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
        if (node.offsetWidth === 0) {
            var styles = getComputedStyle(node, null)
            if (rdisplayswap.test(styles["display"])) {
                var obj = {
                    node: node
                }
                for (var name in cssShow) {
                    obj[name] = styles[name]
                    node.style[name] = cssShow[name]
                }
                array.push(obj)
            }
            var parent = node.parentNode
            if (parent && parent.nodeType == 1) {
                showHidden(parent, array)
            }
        }
    }

    "Width,Height".replace(rword, function(name) {//fix 481
        var method = name.toLowerCase(),
                clientProp = "client" + name,
                scrollProp = "scroll" + name,
                offsetProp = "offset" + name
        cssHooks[method + ":get"] = function(node, which, override) {
            var boxSizing = -4
            if (typeof override === "number") {
                boxSizing = override
            }
            which = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
            var ret = node[offsetProp] // border-box 0
            if (boxSizing === 2) { // margin-box 2
                return ret + avalon.css(node, "margin" + which[0], true) + avalon.css(node, "margin" + which[1], true)
            }
            if (boxSizing < 0) { // padding-box  -2
                ret = ret - avalon.css(node, "border" + which[0] + "Width", true) - avalon.css(node, "border" + which[1] + "Width", true)
            }
            if (boxSizing === -4) { // content-box -4
                ret = ret - avalon.css(node, "padding" + which[0], true) - avalon.css(node, "padding" + which[1], true)
            }
            return ret
        }
        cssHooks[method + "&get"] = function(node) {
            var hidden = [];
            showHidden(node, hidden);
            var val = cssHooks[method + ":get"](node)
            for (var i = 0, obj; obj = hidden[i++]; ) {
                node = obj.node
                for (var n in obj) {
                    if (typeof obj[n] === "string") {
                        node.style[n] = obj[n]
                    }
                }
            }
            return val;
        }
        avalon.fn[method] = function(value) { //会忽视其display
            var node = this[0]
            if (arguments.length === 0) {
                if (node.setTimeout) { //取得窗口尺寸,IE9后可以用node.innerWidth /innerHeight代替
                    return node["inner" + name]
                }
                if (node.nodeType === 9) { //取得页面尺寸
                    var doc = node.documentElement
                    //FF chrome    html.scrollHeight< body.scrollHeight
                    //IE 标准模式 : html.scrollHeight> body.scrollHeight
                    //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                    return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp])
                }
                return cssHooks[method + "&get"](node)
            } else {
                return this.css(method, value)
            }
        }
        avalon.fn["inner" + name] = function() {
            return cssHooks[method + ":get"](this[0], void 0, -2)
        }
        avalon.fn["outer" + name] = function(includeMargin) {
            return cssHooks[method + ":get"](this[0], void 0, includeMargin === true ? 2 : 0)
        }
    })
    avalon.fn.offset = function() { //取得距离页面左右角的坐标
        var node = this[0], box = {
            left: 0,
            top: 0
        }
        if (!node || !node.tagName || !node.ownerDocument) {
            return box
        }
        var doc = node.ownerDocument,
                root = doc.documentElement,
                win = doc.defaultView
        if (!root.contains(node)) {
            return box
        }
        if (node.getBoundingClientRect !== void 0) {
            box = node.getBoundingClientRect()
        }
        return {
            top: box.top + win.pageYOffset - root.clientTop,
            left: box.left + win.pageXOffset - root.clientLeft
        }
    }
    //=============================val相关=======================

    function getValType(el) {
        var ret = el.tagName.toLowerCase()
        return ret === "input" && /checkbox|radio/.test(el.type) ? "checked" : ret
    }
    var valHooks = {
        "select:get": function(node, value) {
            var one = node.multiple
            var values = one ? null : []
            for (var i = 0, option; option = node.options[i++]; ) {
                if (option.selected && !option.disabled) {
                    value = option.value
                    if (one) {
                        return value
                    }
                    //收集所有selected值组成数组返回
                    values.push(value)
                }
            }
            return  values
        },
        "select:set": function(node, values, optionSet) {
            values = [].concat(values) //强制转换为数组
            for (var i = 0, el; el = node.options[i++]; ) {
                if ((el.selected = values.indexOf(el.value) >= 0)) {
                    optionSet = true
                }
            }
            if (!optionSet) {
                node.selectedIndex = -1
            }
        }
    }
    /************************************************************************
     *        HTML处理(parseHTML, innerHTML, clearHTML)                    *
     ****************************************************************************/
    !function(t) {
        var rtagName = /<([\w:]+)/
        var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig

        var tagHooks = {
            g: [1, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">', '</svg>'],
            //IE6-8在用innerHTML生成节点时，不能直接创建no-scope元素与HTML5的新标签
            _default: [0, "", ""]  //div可以不用闭合
        }


        String("circle,defs,ellipse,image,line,path,polygon,polyline,rect,symbol,text,use").replace(rword, function(tag) {
            tagHooks[tag] = tagHooks.g //处理SVG
        })

        avalon.parseHTML = function(html) {
            html = html.replace(rxhtml, "<$1></$2>").trim()
            var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase()
            var wrap = tagHooks[tag] || tagHooks._default
            t.innerHTML = wrap[1] + html + wrap[2]
            var wrapper = t.content
            if (wrap[0]) {
                var fragment = wrapper.cloneNode(false)
                wrapper = wrapper.lastChild
                while (tag = wrapper.firstChild) { // 将wrapper上的节点转移到文档碎片上！
                    fragment.appendChild(tag)
                }
                return fragment
            }
            return wrapper
        }
        avalon.clearHTML = function(node) {
            node.textContent = ""
            return node
        }
        avalon.innerHTML = function(node, html) {
            var a = this.parseHTML(html)
            this.clearHTML(node).appendChild(a)
        }
    }(DOC.createElement("template"));
    /*********************************************************************
     *                            扫描系统                                *
     **********************************************************************/
    var scanObject = {}
    avalon.scanCallback = function(fn, group) {
        group = group || "$all"
        var array = scanObject[group] || (scanObject[group] = [])
        array.push(fn)
    }
    avalon.scan = function(elem, vmodel, group) {
        elem = elem || root
        group = group || "$all"
        var array = scanObject[group] || []
        var vmodels = vmodel ? [].concat(vmodel) : []
        var scanIndex = 0;
        var scanAll = false
        var fn
        var dirty = false
        function cb(i) {
            scanIndex += i
            dirty = true
            setTimeout(function() {
                if (scanIndex <= 0 && !scanAll) {
                    scanAll = true
                    while (fn = array.shift()) {
                        fn()
                    }
                }
            })
        }
        vmodels.cb = cb
        scanTag(elem, vmodels)
        //html, include, widget
        if (!dirty) {
            while (fn = array.shift()) {
                fn()
            }
        }
    }

    //http://www.w3.org/TR/html5/syntax.html#void-elements
    var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,noscript,script,style,textarea".toUpperCase())

    function checkScan(elem, callback, innerHTML) {
        var id = setTimeout(function() {
            var currHTML = elem.innerHTML
            clearTimeout(id)
            if (currHTML === innerHTML) {
                callback()
            } else {
                checkScan(elem, callback, currHTML)
            }
        })
    }

    function scanTag(elem, vmodels, node) {
        //扫描顺序  ms-skip(0) --> ms-important(1) --> ms-controller(2) --> ms-if(10) --> ms-repeat(100) 
        //--> ms-if-loop(110) --> ms-attr(970) ...--> ms-each(1400)-->ms-with(1500)--〉ms-duplex(2000)垫后        
        var a = elem.getAttribute("ms-skip")
        var b = elem.getAttributeNode("ms-important")
        var c = elem.getAttributeNode("ms-controller")
        if (typeof a === "string") {
            return
        } else if (node = b || c) {
            var newVmodel = avalon.vmodels[node.value]
            if (!newVmodel) {
                return
            }
            //ms-important不包含父VM，ms-controller相反
            var cb = vmodels.cb
            vmodels = node === b ? [newVmodel] : [newVmodel].concat(vmodels)
            vmodels.cb = cb
            elem.removeAttribute(node.name) //removeAttributeNode不会刷新[ms-controller]样式规则
            elem.classList.remove(node.name)
            createSignalTower(elem, newVmodel)
            elem.setAttribute("avalonctrl", node.value)
            newVmodel.$events.expr = elem.tagName + '[avalonctrl="' + node.value + '"]'
        }
        scanAttr(elem, vmodels) //扫描特性节点
    }

    function createSignalTower(elem, vmodel) {
        var id = elem.getAttribute("avalonctrl") || vmodel.$id
        elem.setAttribute("avalonctrl", id)
        vmodel.$events.expr = elem.tagName + '[avalonctrl="' + id + '"]'
    }

    function scanNodeList(parent, vmodels) {
        var node = parent.firstChild
        while (node) {
            var nextNode = node.nextSibling
            scanNode(node, node.nodeType, vmodels)
            node = nextNode
        }
    }

    function scanNodeArray(nodes, vmodels) {
        for (var i = 0, node; node = nodes[i++]; ) {
            scanNode(node, node.nodeType, vmodels)
        }
    }
    function scanNode(node, nodeType, vmodels) {
        if (nodeType === 1) {
            scanTag(node, vmodels) //扫描元素节点
        } else if (nodeType === 3 && rexpr.test(node.data)) {
            scanText(node, vmodels) //扫描文本节点
        } else if (kernel.commentInterpolate && nodeType === 8 && !rexpr.test(node.nodeValue)) {
            scanText(node, vmodels) //扫描注释节点
        }
    }

    function scanText(textNode, vmodels) {
        var bindings = []
        if (textNode.nodeType === 8) {
            var leach = []
            var value = trimFilter(textNode.nodeValue, leach)
            var token = {
                expr: true,
                value: value
            }
            if (leach.length) {
                token.filters = leach
            }
            var tokens = [token]
        } else {
            tokens = scanExpr(textNode.data)
        }
        if (tokens.length) {
            for (var i = 0, token; token = tokens[i++]; ) {
                var node = DOC.createTextNode(token.value) //将文本转换为文本节点，并替换原来的文本节点
                if (token.expr) {
                    var filters = token.filters
                    var binding = {
                        type: "text",
                        element: node,
                        value: token.value,
                        filters: filters
                    }
                    if (filters && filters.indexOf("html") !== -1) {
                        avalon.Array.remove(filters, "html")
                        binding.type = "html"
                        binding.group = 1
                        if (!filters.length) {
                            delete bindings.filters
                        }
                    }
                    bindings.push(binding) //收集带有插值表达式的文本
                }
                hyperspace.appendChild(node)
            }
            textNode.parentNode.replaceChild(hyperspace, textNode)
            if (bindings.length)
                executeBindings(bindings, vmodels)
        }
    }

    var rmsAttr = /ms-(\w+)-?(.*)/
    var priorityMap = {
        "if": 10,
        "repeat": 90,
        "data": 100,
        "widget": 110,
        "each": 1400,
        "with": 1500,
        "duplex": 2000,
        "on": 3000
    }

    var ons = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scroll,submit")

    function scanAttr(elem, vmodels) {
        var attributes = elem.attributes
        var bindings = [],
                msData = {},
                match
        for (var i = 0, attr; attr = attributes[i++]; ) {
            if (attr.specified) {
                if (match = attr.name.match(rmsAttr)) {
                    //如果是以指定前缀命名的
                    var type = match[1]
                    var param = match[2] || ""
                    var value = attr.value
                    var name = attr.name
                    msData[name] = value
                    if (ons[type]) {
                        param = type
                        type = "on"
                    }
                    if (typeof bindingHandlers[type] === "function") {
                        var binding = {
                            type: type,
                            param: param,
                            element: elem,
                            name: match[0],
                            value: value,
                            priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
                        }
                        if (type === "if" && param === "loop") {
                            binding.priority += 100
                        }
                        if (vmodels.length) {
                            bindings.push(binding)
                            if (type === "widget") {
                                elem.msData = elem.msData || msData
                            }
                        }
                    }
                }
            }
        }
        if (msData["ms-attr-checked"] && msData["ms-duplex"]) {
            log("warning!一个元素上不能同时定义ms-checked与ms-duplex")
        }
        bindings.sort(function(a, b) {
            return a.priority - b.priority
        })
        var firstBinding = bindings[0] || {}
        switch (firstBinding.type) {
            case "if":
            case "repeat":
            case "widget":
                executeBindings([firstBinding], vmodels)
                break
            default:
                executeBindings(bindings, vmodels)
                if (!stopScan[elem.tagName] && rbind.test(elem.innerHTML + elem.textContent)) {
                    scanNodeList(elem, vmodels) //扫描子孙元素
                }
                break;
        }
    }

    function executeBindings(bindings, vmodels) {
        if (bindings.length)
            vmodels.cb(bindings.length)
        for (var i = 0, data; data = bindings[i++]; ) {
            data.vmodels = vmodels
            bindingHandlers[data.type](data, vmodels)
            if (data.evaluator && data.element && data.element.nodeType === 1) { //移除数据绑定，防止被二次解析
                //chrome使用removeAttributeNode移除不存在的特性节点时会报错 https://github.com/RubyLouvre/avalon/issues/99
                data.element.removeAttribute(data.name)
            }
        }
        bindings.length = 0
    }

    var rfilters = /\|\s*(\w+)\s*(\([^)]*\))?/g,
            r11a = /\|\|/g,
            r11b = /U2hvcnRDaXJjdWl0/g
    function trimFilter(value, leach) {
        if (value.indexOf("|") > 0) { // 抽取过滤器 先替换掉所有短路与
            value = value.replace(r11a, "U2hvcnRDaXJjdWl0") //btoa("ShortCircuit")
            value = value.replace(rfilters, function(c, d, e) {
                leach.push(d + (e || ""))
                return ""
            })
            value = value.replace(r11b, "||") //还原短路与
        }
        return value
    }

    function scanExpr(str) {
        var tokens = [],
                value, start = 0,
                stop

        do {
            stop = str.indexOf(openTag, start)
            if (stop === -1) {
                break
            }
            value = str.slice(start, stop)
            if (value) { // {{ 左边的文本
                tokens.push({
                    value: value,
                    expr: false
                })
            }
            start = stop + openTag.length
            stop = str.indexOf(closeTag, start)
            if (stop === -1) {
                break
            }
            value = str.slice(start, stop)
            if (value) { //处理{{ }}插值表达式
                var leach = []
                value = trimFilter(value, leach)
                tokens.push({
                    value: value,
                    expr: true,
                    filters: leach.length ? leach : void 0
                })
            }
            start = stop + closeTag.length
        } while (1)
        value = str.slice(start)
        if (value) { //}} 右边的文本
            tokens.push({
                value: value,
                expr: false
            })
        }

        return tokens
    }

    /*********************************************************************
     *                            bindings                               *
     **********************************************************************/
    var bindingExecutors = avalon.bindingExecutors = {
        "text": function(val, elem) {
            val = val == null ? "" : val //不在页面上显示undefined null
            if (elem.nodeType === 3) { //绑定在文本节点上
                elem.data = val
            } else { //绑定在特性节点上
                elem.textContent = val
            }
        }
    }
    // function 

    var bindingHandlers = avalon.bindingHandlers = {
        "text": function(data, vmodels) {
            var vars = getVars(data.value)
            var paths = getPaths(data.value)
            avalon.parseExprProxy(data.value, vmodels, data)

            for (var i = 0, n = paths.length; i < n; i++) {
                var path = new Path(paths[i]);
                (function(v, expr) {
                    if (v) {
                        function callback(a) {
                           // console.log(vmodels)
                            //如果元素已经被移除
                            var is$unwatch = !data.element || !root.contains(data.element)
                            try {
                                if (!is$unwatch) {
                                    var evaluator = data.evaluator
                                    var c = ronduplex.test(data.type) ? data : evaluator.apply(0, data.args)
                                    data.handler(c, data.element, data)
                                }
                            } catch (e) {
                                is$unwatch = true
                            }
                            if (is$unwatch) {
                                v.$unwatch(path + "", callback)
                                restoreBinding(data)
                            }
                        }
                        v.$watch(expr, callback)
                        callback()
                    }

                })(getHost(path.top, vmodels), path + "")
            }
        }
    }

    function restoreBinding(data) {
        delete data.evaluator
        var node = data.element
        if (node && node.nodeType === 3) {
            var parent = node.parentNode
            if (kernel.commentInterpolate) {
                parent.replaceChild(DOC.createComment(data.value), node)
            } else {
                node.data = openTag + data.value + closeTag
            }
        }
    }

    function getHost(top, vmodels) {
        for (var i = 0, v; v = vmodels[i++]; ) {
            v.hasOwnProperty(top)
            return v
        }
    }

    function Path(path) {
        this.source = path
        //aaa['bbb'] --> aaa.bbb
        //aaa[ "ddd" ][ '333' ] --> aaa.ddd.333
        //去掉中括号内侧的空白
//        path = path.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]")
//        path = path.replace(/\[['"]?([^'"]+)['"]?\]/g, function(match, name) {
//            return '.' + name;
//        })
        // b.c["333" + d] 如果中括号里面是一个变量 --> b.c.`avalon.subscribers` --> b.c.$12321323
        path = path.replace(rvolatile, function() {
            return '.' + avalon.subscribers
        })
        this.parts = path.split(".")
        this.top = this.parts[0]
    }
    Path.prototype = {
        constructor: Path,
        toString: function() {
            return this.parts.join(".")
        },
        match: function(vmodel) {

        }
    }
    /*********************************************************************
     *                          编译系统                                  *
     **********************************************************************/
    var keywords =
            // 关键字
            "break,case,catch,continue,debugger,default,delete,do,else,false" +
            ",finally,for,function,if,in,instanceof,new,null,return,switch,this" +
            ",throw,true,try,typeof,var,void,while,with"
            // 保留字
            + ",abstract,boolean,byte,char,class,const,double,enum,export,extends" +
            ",final,float,goto,implements,import,int,interface,long,native" +
            ",package,private,protected,public,short,static,super,synchronized" +
            ",throws,transient,volatile"
            // ECMA 5 - use strict
            + ",arguments,let,yield" + ",undefined"

    var cacheVars = createCache(512)
    var rpaths = /\b[\$\_a-z][\w$]*(?:\.[$\w]+|\[[^\]]+\])*/ig
    var keywordOne = oneObject(keywords)
    var rstringLiterals = /(['"])(\\\1|.)+?\1/g
    var rregexp = /([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g
    var rcomment1 = /\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g
    var rcomment2 = /\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g
    var rvolatile = /\[([^\]]+)\]/g

    var cachePaths = createCache(512)
    //有多少个路径，绑多少次
    function getPaths(code, paths) {
        var key = "," + code.trim()
        if (cachePaths[key])
            return cachePaths[key]
        paths = paths || []
        //  var brackets = ","
        //http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
        var uid = '_' + +new Date(),
                primatives = [],
                primIndex = 0
        code
                .replace(/\[\s*(['"])([^'"]+)\1\s*\]/g, function($0, $1, $2) {
                    return '.' + $2;
                })
                /* 移除所有字符串*/
                .replace(rstringLiterals, function(match) {
                    primatives[primIndex] = match;
                    return (uid + '') + primIndex++;
                })
                /* 移除所有正则 */
                .replace(rregexp, function($0, $1, $2) {
                    primatives[primIndex] = $2;
                    return $1 + (uid + '') + primIndex++;
                })
                .replace(rcomment1, "")
                .replace(rcomment2, "")
                .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), "")
                .replace(rpaths, function(a) {
                    if (keywordOne[a])
                        return

                    var inner = getBracket(a.replace(RegExp(uid + '(\\d+)', 'g'), ""))

                    for (var j = 0, jn = inner.length; j < jn; j++) {
                        getPaths(inner[j], paths)
                    }

                    //还原字符串与正则
                    paths.push(a.replace(RegExp(uid + '(\\d+)', 'g'), function(match, n) {
                        return primatives[n];
                    }))
                })
        //    var array = uniqSet(paths)

        return  cachePaths(key, uniqSet(paths))
    }
    function getBracket(code) {
        var array = []
        code.replace(rvolatile, function(a, b) {
            array.push(b)
        })
        return array
    }
    function getVars(code) {
        var key = "," + code.trim()
        if (cacheVars[key]) {
            return cacheVars[key]
        }
        //得到顶层VM的属性名
        var paths = getPaths(code)
        //   var brackets = paths.brackets
        var map = {}
        var vars = []
        var rpath = /^[\$\_a-z][\w$]*/
        for (var i = 0, path; path = paths[i++]; ) {
            path = path.replace(rpath, function(_) {
                map["_" + _] = true
                vars.push(_)
                return ""
            })
        }
        return vars

    }

    /*添加赋值语句*/

    function addAssign(vars, scope, name, data) {
        var ret = [],
                prefix = " = " + name + "."
        for (var i = vars.length, prop; prop = vars[--i]; ) {
            if (scope.hasOwnProperty(prop)) {
                ret.push(prop + prefix + prop)
                if (data.type === "duplex") {
                    vars.get = name + "." + prop
                }
                vars.splice(i, 1)
            }
        }
        return ret
    }

    function uniqSet(array) {
        var ret = [],
                unique = {}
        for (var i = 0; i < array.length; i++) {
            var el = array[i]
            var id = el && typeof el.$id === "string" ? el.$id : el
            if (!unique[id]) {
                unique[id] = ret.push(el)
            }
        }
        return ret
    }


    function createCache(maxLength) {
        var keys = []

        function cache(key, value) {
            if (keys.push(key) > maxLength) {
                delete cache[keys.shift()]
            }
            return cache[key] = value;
        }
        return cache;
    }
    //缓存求值函数，以便多次利用
    var cacheExprs = createCache(128)
    //取得求值函数及其传参
    var rduplex = /\w\[.*\]|\w\.\w/
    var rproxy = /(\$proxy\$[a-z]+)\d+$/

    function parseExpr(code, scopes, data) {
        var dataType = data.type
        var filters = data.filters ? data.filters.join("") : ""
        var exprId = scopes.map(function(el) {
            return String(el.$id).replace(rproxy, "$1")
        }) + code + dataType + filters



        var vars = getVars(code).concat(),
                assigns = [],
                names = [],
                args = [],
                prefix = ""
        //args 是一个对象数组， names 是将要生成的求值函数的参数
        scopes = uniqSet(scopes)
        data.vars = []
        for (var i = 0, sn = scopes.length; i < sn; i++) {
            if (vars.length) {
                var name = "vm" + expose + "_" + i
                names.push(name)
                args.push(scopes[i])
                var ss = addAssign(vars, scopes[i], name, data)
                if (ss.length) {
                    // console.log(vars)
                    assigns.push.apply(assigns, ss)
                }

            }
        }
        if (!assigns.length && dataType === "duplex") {
            return
        }

        //---------------args----------------
        if (filters) {
            args.push(avalon.filters)
        }
        data.args = args
        //---------------cache----------------
        var fn = cacheExprs[exprId] //直接从缓存，免得重复生成
        if (fn) {
            data.evaluator = fn
            return
        }
        var prefix = assigns.join(", ")
        if (prefix) {
            prefix = "var " + prefix
        }
        if (filters) { //文本绑定，双工绑定才有过滤器
            code = "\nvar ret" + expose + " = " + code
            var textBuffer = [],
                    fargs
            textBuffer.push(code, "\r\n")
            for (var i = 0, fname; fname = data.filters[i++]; ) {
                var start = fname.indexOf("(")
                if (start !== -1) {
                    fargs = fname.slice(start + 1, fname.lastIndexOf(")")).trim()
                    fargs = "," + fargs
                    fname = fname.slice(0, start).trim()
                } else {
                    fargs = ""
                }
                textBuffer.push(" if(filters", expose, ".", fname, "){\n\ttry{\nret", expose,
                        " = filters", expose, ".", fname, "(ret", expose, fargs, ")\n\t}catch(e){} \n}\n")
            }
            code = textBuffer.join("")
            code += "\nreturn ret" + expose
            names.push("filters" + expose)
        } else if (dataType === "duplex") { //双工绑定
            var _body = "'use strict';\nreturn function(vvv){\n\t" +
                    prefix +
                    ";\n\tif(!arguments.length){\n\t\treturn " +
                    code +
                    "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) +
                    "= vvv;\n} "
            try {
                fn = Function.apply(noop, names.concat(_body))
                data.evaluator = cacheExprs(exprId, fn)
            } catch (e) {
                log("debug: parse error," + e.message)
            }
            return
        } else if (dataType === "on") { //事件绑定
            if (code.indexOf("(") === -1) {
                code += ".call(this, $event)"
            } else {
                code = code.replace("(", ".call(this,")
            }
            names.push("$event")
            code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
            var lastIndex = code.lastIndexOf("\nreturn")
            var header = code.slice(0, lastIndex)
            var footer = code.slice(lastIndex)
            code = header + "\n" + footer
        } else { //其他绑定
            code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        }
        try {
            fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
            data.evaluator = cacheExprs(exprId, fn)
        } catch (e) {

        } finally {
            vars = textBuffer = names = null //释放内存
        }
    }

    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    }
    var quote = window.JSON && JSON.stringify || function(str) {
        return '"' + str.replace(/[\\\"\x00-\x1f]/g, function(a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"'
    }
    //parseExpr的智能引用代理

    function parseExprProxy(code, scopes, data, tokens, noregister) {
        scopes.cb(-1)
        if (Array.isArray(tokens)) {
            code = tokens.map(function(el) {
                return el.expr ? "(" + el.value + ")" : quote(el.value)
            }).join(" + ")
        }
        parseExpr(code, scopes, data)
        if (data.evaluator && !noregister) {
            data.handler = bindingExecutors[data.handlerName || data.type]
            //方便调试
            //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
            //将它移出订阅者列表
            //registerSubscriber(data)
        }
    }

    avalon.parseExprProxy = parseExprProxy


    var ronduplex = /^(duplex|on)$/
    function registerSubscriber(data) {

    }

    DOC.addEventListener("DOMContentLoaded", function() {
        avalon.scan(document.body)
    })

})(document)