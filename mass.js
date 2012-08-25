+ function(){
    //后端部分　2012.7.11 by 司徒正美
    function $(){}
    var class2type = {  //类型映射
        "[object global]" : "Global" ,
        "null" : "Null" ,
        "NaN"  : "NaN"  ,
        "undefined" : "Undefined"
    }
    ,rparams =  /[^\(]*\(([^\)]*)\)[\d\D]*///用于取得函数的参数列表
    , uuid     = 1
    , toString = class2type.toString
    //为[[class]] --> type 映射对象添加更多成员,用于$.type函数
    "Boolean,Number,String,Function,Array,Date,RegExp,Arguments".replace(/\w+/g,function(name){
        class2type[ "[object " + name + "]" ] = name;
    });
    //将一个或多个对象合并到第一个参数（它也必须是对象）中，
    //如果只有一个参数，则合并到mix的调用者上，如果最后一个参数是布尔，则用于判定是否覆盖已有属性
    function mix( receiver, supplier ){
        var args = Array.apply([], arguments ),i = 1, key,//如果最后参数是布尔，判定是否覆写同名属性
        ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
        if(args.length === 1){//处理$.mix(hash)的情形
            receiver = !this.window ? this : {} ;
            i = 0;
        }
        while((supplier = args[i++])){
            for ( key in supplier ) {//允许对象糅杂，用户保证都是对象
                if (supplier.hasOwnProperty(key) && (ride || !(key in receiver))) {
                    receiver[ key ] = supplier[ key ];
                }
            }
        }
        return receiver;
    };
    function pad(n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10);
    }
    mix( $, {//为此版本的命名空间对象添加成员
        rword: /[^, ]+/g,
        mix:  mix,
        "@debug" : true,
        isWindows: process.platform === 'win32',//判定当前平台是否为window
        //将类数组对象转换成真正的数组，并进行切片操作(如果第二第三参数存在的情况下)
        slice: function ( nodes, start, end ) {
            var ret = [], n = nodes.length
            if(end === void 0 || typeof end == "number" && isFinite(end)){
                start = parseInt(start,10) || 0
                end = end == void 0 ? n : parseInt(end, 10)
                if(start < 0){
                    start += n
                }
                if(end > n){
                    end = n
                }
                if(end < 0){
                    end += n
                }
                for (var i = start; i < end; ++i) {
                    ret[i - start] = nodes[i];
                }
            }
            return ret;
        },
        getUid:  function( node ){
            return node.uniqueNumber || ( node.uniqueNumber = uuid++ );
        },
        // 创建一个对象，其键值都为1(如果没有指定)或第二个参数，用于用于高速化判定
        oneObject: function(array, val){
            if(typeof array == "string"){
                array = array.match($.rword) || [];
            }
            var result = {},value = val !== void 0 ? val :1;
            for(var i=0, n=array.length;i < n; i++){
                result[ array[i] ] = value;
            }
            return result;
        },
        // 用于取得数据的类型（一个参数的情况下）或判定数据的类型（两个参数的情况下）
        type: function (obj, str){
            var result = class2type[ (obj == null || obj !== obj )? obj : toString.call(obj) ] || "#";
            if( result.charAt(0) === "#"){
                if(Buffer.isBuffer(obj)){
                    result = 'Buffer'; //返回构造器名字
                }else{
                    result = toString.call(obj).slice(8,-1);
                }
            }
            if(str){
                return str === result;
            }
            return result;
        },
        path: require("path"),//将原生path模块劫持到命名空间中
        //一个空对象,将被app/config模块所重写
        config: {
            services:[]
        },
        noop: function(){},
        logger: {//这是一个空接口
            write:function(){}
        },
        // $.log(str, [], color, timestamp, level )
        log: function (str){
            var level = 9, orig = str, util = require("util"), show = true, timestamp = false;
            if(arguments.length === 1){
                $.logger.write(9, util.inspect(orig))
                return console.log( orig );
            }
            for(var i = 1 ; i < arguments.length; i++){
                var el = arguments[i]
                if(Array.isArray(el)){
                    el.unshift(str);
                    str = util.format.apply(0,el)
                }else if(typeof el == "string"){
                    if(styles[el]){
                        str = '\u001b[' + styles[el][0] + 'm' + str + '\u001b[' + styles[el][1] + 'm';
                    //是否在前面加上时间戮
                    }else if(el === "timestamp"){
                        timestamp = true;
                    }
                }else if( typeof el == "number" ){
                    show = el <= $.log.level;
                    level = el;
                }
            }
            $.logger.write(level,util.inspect(orig))
            if(show){
                if(timestamp){
                    str = $.timestamp() +"  "+ str
                }
                console.log(str)
            }
        },
        timestamp: function () {
            var d = new Date();
            var time = [pad(d.getHours()),  pad(d.getMinutes()),  pad(d.getSeconds())].join(':');
            return [d.getFullYear(), pad(d.getMonth()), d.getDate(), time].join(' ');
        },
        define: function(deps, callback){
            var caller = arguments.callee.caller
            var args = caller.arguments;//取得当前模块的参数列表,依次为exports, require, module, __filename,__dirname
            var common = {
                exports: args[0],
                require: args[1],
                module:  args[2]
            }
            var array = [], ret;
            if(arguments.length === 1 && toString.call(deps) === "[object Object]"){
                ret = deps;//如果是对象,那么它就是exports
            }else if(typeof deps == "string" ){
                deps = deps.match( $.rword );//如果依赖列表是字符串,则转换为数组
            }
            if(Array.isArray(deps)){//如果存在依赖关系,先加载依赖关系
                for(var i = 0, el; el = deps[i++]; ){
                    array[ array.length ] =  args[1]( el );//require某个模块
                }
            }
            callback = arguments[arguments.length - 1];
            if(typeof callback == "function"){
                var match = callback.toString().replace(rparams,"$1") || [];
                var a = common[match[0]];
                var b = common[match[1]];
                var c = common[match[2]];
                if( a && b && c && a != b && b != c && a != c ){//exports, require, module的位置随便
                    ret =  callback.apply(0, [a, b, c]);
                }else{
                    ret =  callback.apply(0, array);
                }
            }
            if(typeof ret !== "undefined"){
                args[2].exports = ret;
            }
            return args[2].exports;
        },
        require: function(deps, callback){
            if(typeof deps == "string" && deps.indexOf(",") == -1 && !callback){
                return require(deps)
            }
            deps = String(deps).match($.rword)
            var array = [];
            for(var i = 0, el; el = deps[i++];){
                array.push( require(el) )
            }
            if(typeof callback == "function"){
                callback.apply(0, array);
            }
            return array
        }

    });

    //模块加载的根路径,默认是mass.js种子模块所在的目录
    $.require.root = process.cwd();
    $.parseQuery = require("querystring").parse;
    var _join = $.path.join;
    $.path.join = function(){
        var ret = _join.apply(0,arguments)
        return  ret.replace(/\\/g,"/")
    }
    $.parseUrl = require("url").parse; //将原生URL模块的parse劫持下来
    $.error = require("util").error;
    $.debug = require("util").debug;

    //用于实现漂亮的五颜六色的日志打印
    var styles = {
        'bold' : [1, 22],
        'italic' : [3, 23],
        'underline' : [4, 24],
        'inverse' : [7, 27],
        'white' : [37, 39],
        'grey' : [90, 39],
        'black' : [30, 39],
        'blue' : [34, 39],
        'cyan' : [36, 39],
        'green' : [32, 39],
        'magenta' : [35, 39],
        'red' : [31, 39],
        'yellow' : [33, 39]
    };
    //level 越小,显示的日志越少,它们就越重要,但都打印在文本上
    $.log.level = 9;
    //暴露到全局作用域下,所有模块可见!!
    global.define = $.define;
    exports.$ = global.$ = $;
    $.log("后端mass框架","green");
    //生成mass framework所需要的页面
    $.require(["./system/page_generate"],function(){
        $.log("页面生成")
    });
    $.require("./app/config");
    $.require("./system/more/logger");
    $.require("./system/mvc");

//安装过程:
//安装数据库 http://www.mongodb.org/downloads,下载回来放到C盘解压,改名为mongodb
//在C盘下建data目录,里面再建db目录
//启动mongo数据库  C:\mongodb\bin\mongod.exe
//在框架mass.js的所在目录安装mongodb的node.js连接库npm install mongodb
//如果npm安装失败可以是被墙,改用@Python发烧友 提供的代理 npm --registry http://42.121.86.107:1984 install mongodb
//启动框架 node mass

//现在我的首要任务是在瓦雷利亚的海滩上建立一个小渔村
//redis-server.exe .\redis.conf

}();
//https://github.com/codeparty/derby/blob/master/lib/View.js 创建视图的模块
//2011.12.17 $.define再也不用指定模块所在的目录了,
//2012.7.12 重新开始搞后端框架
//2012.8.9  添加parseUrl, parseQuery API
//2012.8.21 重构$.log 添加$.timestamp
//两个文件观察者https://github.com/andrewdavey/vogue/blob/master/src/Watcher.js https://github.com/mikeal/watch/blob/master/main.js
//一个很好的前端工具 https://github.com/colorhook/att
//http://blog.csdn.net/dojotoolkit/article/details/7820321
