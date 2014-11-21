avalon = function() {
}
function noop() {
}
DOC = document
var ap = Array.prototype
var aslice = ap.slice
var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
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
function log() {
    if (window.console && avalon.config.debug) {
        // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
        console.log.apply(console, arguments)
    }
}
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
            var oldValue = change.oldValue
            if (array.length) {
                var newValue = "value" in change ? change.value : object[name]
                var target = "target" in change ? change.target : object
                var oldValue = change.oldValue
                array.forEach(function(fn) {
                    fn.call(target, newValue, oldValue)
                })
            }

            if (Array.isArray(object) && isIndex(name)) {
                var array = events["[*]"]
                if (array.length) {
                    var newValue = "value" in change ? change.value : object[name]
                    var target = "target" in change ? change.target : object
                    var oldValue = change.oldValue
                    array.forEach(function(fn) {
                        fn.call(target, newValue, oldValue)
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
                        value: newValue,
                        target: object
                    });
                    notifier.notify({
                        object: object.$parent,
                        type: "update",
                        name: object.$surname + "[*]",
                        oldValue: oldValue,
                        value: newValue,
                        target: object
                    });
                } else {
                    notifier.notify({
                        object: object.$parent,
                        type: "update",
                        name: object.$surname + "."+ name,
                        oldValue: oldValue,
                        value: newValue,
                        target: object
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