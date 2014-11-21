avalon = function() {
}
function noop() {
}
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
function observeCallback(changes) {
    changes.forEach(function(change) {
        if (change.type === "update") {
            var object = change.object
            var name = change.name
            var events = object.$events
            var array = events[name]
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
            if (object.$parent) {
                var notifier = Object.getNotifier(object.$parent)
                notifier.notify({
                    object: object.$parent,
                    type: "update",
                    name: object.$surname + "." + name,
                    oldValue: oldValue,
                    value: newValue,
                    target: object
                });
                // console.log(object.$surname + "." + name)
                // object.$parent.$fire(object.$surname + "." + name, newValue, oldValue)
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
    $scope.$watch = function(name, fn) {
        var array = this.$events[name] = this.$events[name] || []
        array.push(fn)
    }
    $scope.$fire = function(type) {
        var events = this.$events
        var callbacks = events[type] || []
        var all = events.$all || []
        var args = Array.prototype.slice.call(arguments, 1)
        for (var i = 0, callback; callback = callbacks[i++]; ) {
            if (isFunction(callback))
                callback.apply(this, args)
        }
        for (var i = 0, callback; callback = all[i++]; ) {
            if (isFunction(callback))
                callback.apply(this, arguments)
        }
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

function Collection(array) {
    Object.observe(array, observeCallback)
    return array
}