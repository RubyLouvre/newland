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

    mix( $, {//为此版本的命名空间对象添加成员
        rword: /[^, ]+/g,
        mix:  mix,
        "@debug" : true,
        isWindows: process.platform === 'win32',//判定当前平台是否为window
        //将类数组对象转换成真正的数组，并进行切片操作(如果第二第三参数存在的情况下)
        slice: function (nodes, start, end) {
            return Array.prototype.slice.call(nodes, start, end || nodes.length)
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
        md5: function(str, encoding){
            return require('crypto').createHash('md5').update(str).digest(encoding || 'hex');
        },
        path: require("path"),//将原生path模块劫持到命名空间中
        //它的内容由app/configs模块提供
        configs: {
            intercepters:[]
        },
        //模块加载的定义函数
        define: function( name, deps, factory ){//模块名,依赖列表,模块本身
        //这里只是一个空接口
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
            if( errback ){
                errorStack( errback );//压入错误堆栈
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
                        $.log('<code style="color:cyan;">已加载', id, '模块</code>', true);
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
    $.path.parse = require("url").parse; //将原生URL模块的parse劫持下来
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
            errorStack(function(){
                $.log("<code style='color:red'>",e , "</code>", true);
            }).fire();//打印错误堆栈
        }
    }
    //  once: 保证回调函数列表只能被 .fire() 一次。(就像延迟对象一样)
    //  memory: 持续保留前一个值，当fire之后,将保存其context与args，以后再添加一个新回调时，
    //  立即用这两个东西去调用它，它们只会被下一次的fireWith的参数所改变
    //  unique: 保证一个回调函数只能被添加一次(也就是说，在回调函数列表中，没有重复的回调函数)。
    //  stopOnFalse: 当回调函数返回 false 时，中断调用。
    $.Callbacks  = function(str){//一个简单的异步列队
        var opts = typeof str == "string" ? $.oneObject(str) : {},list = [];
        var context, args, fired
        list.has = function( fn ){
            return list.indexOf( fn ) !== -1
        }
        list.add = function(fn){
            if(!list.locked){//允许在异步fire中添加
                if( typeof fn == "function"  && ( !opts.unique || !list.has( fn ) )  ){
                    list.push( fn )
                }
            }
            if( opts.memory && fired){ //这时只影响当前添加的函数
                fn.apply( context, args )
            }
            return list;
        }
        list.remove = function( fn ){
            var i = isFinite( fn ) ? fn :  this.indexOf(fn);
            if( i > -1 ){
                list.splice(i,1)
                var j = this.indexOf(fn);
                if( j > -1 ){
                    return this.remove( j )
                }
            }
            return list;
        }
        list.lock = function(){//锁住
            list.locked = true;
        }
        list.fire = function(){
            return  list.fireWith(list, $.slice(arguments))
        }
        list.fireWith = function( c, a ){
            if(list.locked !== true  && (!opts.once || !fired ) ){
                context = c, args = $.type( a, "Array") ? a : [];
                var arr = opts.once ? list: list.concat(), fn
                while( ( fn = arr.shift() ) ){
                    var ret = fn.apply( context, args);
                    if( opts.stopOnFalse && ret === false){
                        break;
                    }
                }
                fired = true;
            }
            return list
        }
        return list
    }
    //用于模块加载失败时的错误回调
    var errorStack = $.Callback("once memory");
    //实现漂亮的五颜六色的日志打印
    new function(){
        var rformat = /<code\s+style=(['"])(.*?)\1\s*>([\d\D]+?)<\/code>/ig
        , colors = {}
        , index  = 0
        , formats = {
            bold      : [1, 22],
            italic    : [3, 23],
            underline : [4, 24],
            inverse   : [7, 27],
            strike    : [9, 29]
        };
        "black,red,green,yellow,blue,magenta,cyan,white".replace($.rword, function(word){
            colors[word] = index++;
        });
        colors.gray = 99;
        function format (arr, str) {
            return '\x1b[' + arr[0] + 'm' + str + '\x1b[' + arr[1] + 'm';
        }
        /**
     * 用于调试
     * @param {String} s 要打印的内容
     * @param {Boolean} color 进行各种颜色的高亮，使用<code style="format:blod;color:red;background:green">
     * format的值可以为formats中五个之一或它们的组合（以空格隔开），背景色与字体色只能为colors之一
     */
        $.log = function (s, color){
            var args = Array.apply([],arguments);
            if( args.pop() === true){
                s = args.join("").replace( rformat, function( a, b, style,ret){
                    style.toLowerCase().split(";").forEach(function(arr){
                        arr = arr.split(":");
                        var type = arr[0].trim(),val = (arr[1]||"").trim();
                        switch(type){
                            case "format":
                                val.replace(/\w+/g,function(word){
                                    if(formats[word]){
                                        ret = format(formats[word],ret)
                                    }
                                });
                                break;
                            case "background":
                            case "color":
                                var array = type == "color" ? [30,39] : [40,49]
                                if( colors[val]){
                                    array[0] += colors[val]
                                    ret = format(array,ret)
                                }
                        }
                    });
                    return ret;
                });
            }else{
                s  = [].join.call(arguments,"")
            }
            console.log( s );
        }
    }

    //暴露到全局作用域下,所有模块可见!!
    exports.$ = global.$ = $;
    $.log("<code style='color:green'>后端mass框架</code>",true);

    //    $.require( "test/loader", function(){
    //        console.log("测试结束!!!!!!!!!!!!!")
    //    });
    //装配所有控制器，视图模板，配置文件
    //  $.require("system/server", function(){
    //     $.log($.configs.port)
    //  });
    $.controllers = {}
    $.require("system/deploy,system/mvc", function(deploy){
        deploy(  process.cwd() );//监听app目录下文件的变化,实现热启动
    });
//http://localhost:8888/index.html
//现在我的首要任务是在瓦雷利亚的海滩上建立一个小渔村


})();
//https://github.com/codeparty/derby/blob/master/lib/View.js 创建视图的模块
//2011.12.17 $.define再也不用指定模块所在的目录了,
//如以前我们要对位于intercepters目录下的favicon模块,要命名为mass.define("intercepters/favicon",module),
//才能用mass.require("intercepters/favicon",callback)请求得到
//现在可以直接mass.define("favicon",module)了
//2012.7.12 重新开始搞后端框架
//两个文件观察者https://github.com/andrewdavey/vogue/blob/master/src/Watcher.js https://github.com/mikeal/watch/blob/master/main.js
//一个很好的前端工具 https://github.com/colorhook/att
/*
 * 对此，SpringMVC所提出的方案是：将整个处理流程规范化，并把每一个处理步骤分派到不同的组件中进行处理。

这个方案实际上涉及到两个方面：

处理流程规范化 —— 将处理流程划分为若干个步骤（任务），并使用一条明确的逻辑主线将所有的步骤串联起来
处理流程组件化 —— 将处理流程中的每一个步骤（任务）都定义为接口，并为每个接口赋予不同的实现模式
在SpringMVC的设计中，这两个方面的内容总是在一个不断交叉、互为补充的过程中逐步完善的。

处理流程规范化是目的，对于处理过程的步骤划分和流程定义则是手段。因而处理流程规范化的首要内容就是考虑一个通用的Servlet响应程序大致应该包含的逻辑步骤：

步骤1 —— 对Http请求进行初步处理，查找与之对应的Controller处理类（方法）
步骤2 —— 调用相应的Controller处理类（方法）完成业务逻辑
步骤3 —— 对Controller处理类（方法）调用时可能发生的异常进行处理
步骤4 —— 根据Controller处理类（方法）的调用结果，进行Http响应处理
这些逻辑步骤虽然还在我们的脑海中，不过这些过程恰恰正是我们对整个处理过程的流程化概括，稍后我们就会把它们进行程序化处理。

所谓的程序化，实际上也就是使用编程语言将这些逻辑语义表达出来。在Java语言中，最适合表达逻辑处理语义的语法结构是接口，因此上述的四个流程也就被定义为了四个不同接口，它们分别是：

步骤1 —— HandlerMapping
步骤2 —— HandlerAdapter
步骤3 —— HandlerExceptionResolver
步骤4 —— ViewResolver
结合之前我们对流程组件化的解释，这些接口的定义不正是处理流程组件化的步骤嘛？这些接口，就是组件。 
 */