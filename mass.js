(function(){
    //后端部分　2012.7.11 by 司徒正美
    function $(){}
    var class2type = {  //类型映射
        "[object global]" : "Global" ,
        "null" : "Null" ,
        "NaN"  : "NaN"  ,
        "undefined" : "Undefined"
    }
    , rmodule =  /([^(\s]+)\(?([^)]*)\)?/   //用于从字符串中切割出模块名与真路路径
    , loadings = []                         //正在加载中的模块列表
    , returns  = {}                         //模块的返回值
    , cbi      = 1e5                        //用于生成回调函数的名字
    , uuid     = 1
    , toString = returns.toString
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
        //模块加载的定义函数
        define: function( name, deps, factory ){//模块名,依赖列表,模块本身
        //这是一个空接口
        },
        logger: {//这是一个空接口
            write:function(){}
        },
        // $.log(str, [], color, timestamp, level )
        log : function (str){
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
                    show = el <= $.log.level
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
        //模块加载的请求函数
        require: function( deps, factory, errback ){
            var _deps = {}, args = [], dn = 0, cn = 0;
            factory = typeof factory == "function" ? factory : $.noop;
            String(deps +"").replace( $.rword, function( str ){
                if(str.indexOf("./") === 0){
                    str = str.replace(/^\.\//, "" );
                }
                dn++;
                var match = str.match( rmodule );
                var id  = "@"+ match[1];//模块的ID
                var filename = match[2];//模块的URL
                if(!filename){
                    id = id.replace(/\.js$/,"")
                    filename = $.path.join( factory.parent || $.require.root, match[1] ); //path.join会自动处理../的情况
                    filename = /\.js$/.test(filename) ? filename : filename +".js";
                }
                var input = id;
                try{//先把它当成原生模块进行加载
                    returns[ id ] = require( match[1] );//require自身是缓存请求的
                    mapper[ id ] = {
                        state : 2
                    }
                    process.nextTick( $._checkDeps );//每成功加载一个模块就进行依赖检测
                }catch(e){
                    input = filename
                }
                if( !_deps[ input ] ){
                    args.push( input );
                    _deps[ input ] = "司徒正美";
                }
                if( input === filename &&  !mapper[ input ] ){ //防止重复生成节点与请求
                    mapper[ input ] = {};//state: undefined, 未安装; 1 正在安装; 2 : 已安装
                    loadJS( filename );
                }else if( mapper[ input ].state === 2  ){
                    cn++;
                }
            });
            var id = factory.id || "@cb"+ ( cbi++ ).toString(32);
            if( typeof errback == "function" ){
                errorStack.push( errback );//压入错误堆栈
            }
            mapper[ id ] = mapper[ id ] || {}
            $.mix( mapper[ id ], {//创建或更新模块的状态
                callback: factory,
                id:       id,
                deps:     _deps,
                args:     args,
                state:    1
            }, false);
            //在正常情况下模块只能通过_checkDeps执行
            loadings.unshift( id );
            process.nextTick( $._checkDeps );
        },

        //  模块加载的检测依赖函数,如果一个模块所依赖的其他模块的状态都是2了,那么将它也改成2,并执行回调
        _checkDeps: function (){
            loop:
            for ( var i = loadings.length, filename; filename = loadings[ --i ]; ) {
                var obj = mapper[ filename ], deps = obj.deps || {};
                for( var key in deps ){
                    if( deps.hasOwnProperty( key ) && mapper[ key ].state != 2 ){
                        continue loop;
                    }
                }
                //如果deps是空对象或者其依赖的模块的状态都是2
                if( obj.state !== 2){
                    loadings.splice( i, 1 );//必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
                    obj.state = 2 ;
                    var  id = obj.id;
                    var  ret = collect_rets( id, obj.args ||[], obj.callback );
                    if( id.indexOf("@cb") === -1 ){
                        returns[ id ] = ret;
                        $.log("已加载" + id + "模块","cyan", 6 );
                        $._checkDeps();
                    }
                }
            }
        }
    });
    //把模块有关信息都存放在这里
    var mapper = $.require.cache = {}
    //模块加载的根路径,默认是mass.js种子模块所在的目录
    $.require.root = process.cwd();
    //从returns对象取得依赖列表中的各模块的返回值
    function collect_rets( name, args, fn ){
        for(var i = 0, argv = []; i < args.length ; i++){
            argv.push( returns[ args[i] ] );
        }
        var ret = fn.apply( null, argv );//执行模块工厂，然后把返回值放到returns对象中
        $.debug( name );//想办法取得函法中的exports对象
        return ret;
    }
    $.parseQuery = require("querystring").parse;
    $.parseUrl = require("url").parse; //将原生URL模块的parse劫持下来
    $.noop = $.error = $.debug = function(){};//error, debug现在还是空接口

    //模块加载的加载函数
    function loadJS(  filename ){
        try{
            $.define = function(){//诡变的$.define
                var args = Array.apply([],arguments);
                if( typeof args[1] === "function" ){//处理只有两个参数的情况
                    [].splice.call( args, 1, 0, "" );
                }
                args[2].id = filename; //模块名
                args[2].parent =  filename.slice(0, filename.lastIndexOf( $.path.sep ) + 1) //取得父模块的文件夹
                mapper[ filename ].state = 1;
                process.nextTick( $._checkDeps );//每成功加载一个模块就进行依赖检测
                $.require( args[1], args[2] );
            }
            require( filename );
        }catch( e ){
            $.log( e, "red", 3);
            for(var fn; fn = errorStack.shift(); ){
                fn();//打印错误堆栈
            }
        }
    }

    //用于模块加载失败时的错误回调
    var errorStack = [];
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
    $.log.level = 0;
    //暴露到全局作用域下,所有模块可见!!
    exports.$ = global.$ = $;
    $.log("后端mass框架","green");
    //生成mass framework所需要的页面
    $.require("system/page_generate");
    $.require("system/more/logger");
    $.require("system/mvc");

//安装过程:
//安装数据库 http://www.mongodb.org/downloads,下载回来放到C盘解压,改名为mongodb
//在C盘下建data目录,里面再建db目录
//启动mongo数据库  C:\mongodb\bin\mongod.exe
//在框架mass.js的所在目录安装mongodb的node.js连接库npm install mongodb
//如果npm安装失败可以是被墙,改用@Python发烧友 提供的代理 npm --registry http://42.121.86.107:1984 install mongodb
//启动框架 node mass

//现在我的首要任务是在瓦雷利亚的海滩上建立一个小渔村


})();
  // worker log streams
//        var access = fs.createWriteStream(dir + '/workers.access.log', { flags: 'a' })
//          , error = fs.createWriteStream(dir + '/workers.error.log', { flags: 'a' });
//
//        // redirect stdout / stderr
//        proc.stdout.pipe(access);
//        proc.stderr.pipe(error);
//https://github.com/codeparty/derby/blob/master/lib/View.js 创建视图的模块
//2011.12.17 $.define再也不用指定模块所在的目录了,
//2012.7.12 重新开始搞后端框架
//2012.8.9  添加parseUrl, parseQuery API
//2012.8.21 重构$.log 添加$.timestamp
//两个文件观察者https://github.com/andrewdavey/vogue/blob/master/src/Watcher.js https://github.com/mikeal/watch/blob/master/main.js
//一个很好的前端工具 https://github.com/colorhook/att
//http://blog.csdn.net/dojotoolkit/article/details/7820321
