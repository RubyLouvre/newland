var rparams =  /[^\(]*\(([^\)]*)\)[\d\D]*/
var toString = ({}).toString;
global.define = function(deps, callback){
    var caller = arguments.callee.caller
    var args = Array.apply([],caller.arguments);
//    var cur_exports =  args[0]
    var cur_require =  args[1]
    var cur_module =   args[2]
//    var cur_filename = args[3]
//    var cur_dirname =  args[4]
    var array = [], ret;
    if(arguments.length === 1 && toString.call(deps) === "[object Object]"){
        ret = deps
    }else if(Array.isArray(deps)){
        for(var i = 0; i < deps.length;i++){
            array[ array.length ] =  cur_require(deps[i])
        }
    }
    callback = arguments[arguments.length - 1]
    if(typeof callback == "function"){
        var match = callback.toString().replace(rparams,"$1");
        if(match && match[0] == "require" && match[1] == "exports" && match[2] == "module"){
            ret =  callback.apply(0, args)
        }else{
            ret =  callback.apply(0, array)
        }
    }
    if(typeof ret !== "undefined"){
        cur_module.exports = ret;
    }
    return cur_module.exports
}
var $ = {}
$.require = function(deps, callback){
    if(typeof deps == "string"){
        return require(deps)
    }
    var array = [];
    for(var i = 0, el; el = deps[i++];){
        array.push( require(el) )
    }
    if(typeof callback == "function"){
        callback.apply(0, array);
    }
    return array
}
//测试exports重写
console.log("////////////////////////////////////////")
$.require(["./aaa","./bbb"], function(a, b){
    console.log(a)
    console.log(b)
});
console.log("////////////////////////////////////////")
////测试exports模块依赖
$.require(["./ccc"], function(c){
    console.log(c)
})
console.log("////////////////////////////////////////")
//测试exports模块依赖
$.require(["./ddd"], function(d){
    console.log(d)
});

console.log("////////////////////////////////////////")
//测试exports模块依赖
$.require(["./eee"], function(e){
    console.log(e)
});

console.log("////////////////////////////////////////")
//测试exports模块依赖
$.require(["./more/hhh","./more/iii"], function(e){
    console.log(e)
})



