
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
    , fs = require("fs")
    , path = require("path");

    /**
     * 糅杂，为一个对象添加更多成员
     * @param {Object} receiver 接受者
     * @param {Object} supplier 提供者
     * @return  {Object} 目标对象
     */
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
        //切片操作,通常用于处理Arguments对象
        slice: function (nodes, start, end) {
            return Array.prototype.slice.call(nodes, start, end || nodes.length)
        },
        getUid:  function( node ){
            return node.uniqueNumber || ( node.uniqueNumber = uuid++ );
        },
        /**
         * 生成键值统一的对象，用于高速化判定
         * @param {Array|String} array 如果是字符串，请用","或空格分开
         * @param {Number} val 可选，默认为1
         * @return {Object}
         */
        oneObject: function(array, val){
            if(typeof array == "string"){
                array = array.match($.rword) || [];
            }
            var result = {},value = val !== void 0 ? val :1;
            for(var i=0,n=array.length;i < n;i++){
                result[array[i]] = value;
            }
            return result;
        },
        /**
         * 用于取得数据的类型或判定数据的类型
         * @param {Any} obj 要检测的东西
         * @param {String} str 要比较的类型
         * @return {String|Boolean}
         */
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
        deferred: function(){//一个简单的异步列队
            var list = [], self = function(fn){
                fn && fn.call && list.push( fn );
                return self;
            }
            self.fire = function( fn ){
                list = self.reuse ? list.concat() : list
                while( fn = list.shift() ){
                    fn();
                }
                return list.length ? self : self.complete();
            }
            self.complete = $.noop;
            return self;
        },
        //提供三组对文件夹的批处理:创建文件(夹),创建某一目录的东西到新目录,删除文件(夹)
        mkdirSync: function(url,mode,cb){
            var path = require("path"), arr = url.replace(/\\/g,"/").split("/");
            mode = mode || 0755;
            cb = cb || $.noop;
            if(arr[0]==="."){//处理 ./aaa
                arr.shift();
            }
            if(arr[0] == ".."){//处理 ../ddd/d
                arr.splice(0,2,arr[0]+"/"+arr[1])
            }
            function inner(cur){
                if(!path.existsSync(cur)){//不存在就创建一个
                    fs.mkdirSync(cur, mode);
                    $.log("<code style='color:green'>创建目录"+cur+"成功</code>", true);
                }
                if(arr.length){
                    inner(cur + "/"+arr.shift());
                }else{
                    cb();
                }
            }
            arr.length && inner(arr.shift());
        } ,
        cpdirSync: function() {
            return function cpdirSync( old, neo ) {
                var arr = fs.readdirSync(old), folder, stat;
                if(!path.existsSync(neo)){//创建新文件
                    fs.mkdirSync(neo, 0755);
                    $.log("<code style='color:green'>创建目录"+neo + "/" + el+"成功</code>",true);
                }
                for(var i = 0, el ; el = arr[i++];){
                    folder = old + "/" + el
                    stat = fs.statSync(folder);
                    if(stat.isDirectory()){
                        cpdirSync(folder, neo + "/" + el)
                    }else{
                        fs.writeFileSync(neo + "/" + el,fs.readFileSync(folder));
                        $.log("<code style='color:magenta'>创建文件"+neo + "/" + el+"成功</code>",true);
                    }
                }
            }
        }(),
        rmdirSync: (function(){
            function iterator(url,dirs){
                var stat = fs.statSync(url);
                if(stat.isDirectory()){
                    dirs.unshift(url);//收集目录
                    inner(url,dirs);
                }else if(stat.isFile()){
                    fs.unlinkSync(url);//直接删除文件
                }
            }
            function inner(path,dirs){
                var arr = fs.readdirSync(path);
                for(var i = 0, el ; el = arr[i++];){
                    iterator(path+"/"+el,dirs);
                }
            }
            return function(dir,cb){
                cb = cb || $.noop;
                var dirs = [];
                try{
                    iterator(dir,dirs);
                    for(var i = 0, el ; el = dirs[i++];){
                        fs.rmdirSync(el);//一次性删除所有收集到的目录
                    }
                    cb()
                }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
                    e.code === "ENOENT" ? cb() : cb(e);
                }
            }
        })()
    });

    $.noop = $.error = $.debug = function(){};
    "Boolean,Number,String,Function,Array,Date,RegExp,Arguments".replace($.rword,function(name){
        class2type[ "[object " + name + "]" ] = name;
    });
    //实现漂亮的日志打印
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
    var errorStack = $.deferred()
    var mapper = $[ "@modules" ] = { };//后端不需要dom Ready
    function install( name, deps, fn ){
        for ( var i = 0,argv = [], d; d = deps[i++]; ) {
            argv.push( returns[ d ] );//从returns对象取得依赖列表中的各模块的返回值
        }
        var ret = fn.apply( null, argv );//执行模块工厂，然后把返回值放到returns对象中
        $.debug( name );//想办法取得函法中的exports对象
        return ret;
    }
    function goTop(path, user){
        for(var a = path+user;/\.\./.test(a); a=a.replace(/\w+\/\.\.\//g,"") );
        return a;
    }
    var nativeModules = $.oneObject("assert,child_process,cluster,crypto,dgram,dns,"+
        "events,fs,http,https,net,os,path,querystring,readline,repl,tls,tty,url,util,vm,zlib")
    function loadJS( name, url ){
        var nick = name.slice(1);
        if( nativeModules[ nick ]){
            mapper[ name ].state = 2;
            returns[ name ] = require( nick );
            url = nick;
            process.nextTick( $._checkDeps );
        }else{
            try{
                var _define = $.define;
                $.define = function(){
                    var args = Array.apply([],arguments);
                    args[0] = nick;      //自动修正名字;
                    $.define = _define;  //还原为真正的define
                    args[args.length - 1]["@path"] = nick.slice( 0, nick.lastIndexOf("/") + 1);//取得被依赖模块的文件夹
                    _define.apply($, args);
                }
                url = url || path.join( process.cwd(), nick + ".js");
                require( url );
                process.nextTick( $._checkDeps );
            }catch( e ){
                errorStack(function(){
                    $.log("<code style='color:red'>",e , "</code>", true);
                }).fire();//打印错误堆栈
            }
        }
    }

    $.mix( $, {
        //检测此JS模块的依赖是否都已安装完毕,是则安装自身
        _checkDeps: function (){
            loop:
            for ( var i = loadings.length, name; name = loadings[ --i ]; ) {
                var obj = mapper[ name ], deps = obj.deps;
                for( var key in deps ){
                    if( deps.hasOwnProperty( key ) && mapper[ key ].state != 2 ){
                        continue loop;
                    }
                }
                //如果deps是空对象或者其依赖的模块的状态都是2
                if( obj.state !== 2){
                    loadings.splice( i, 1 );//必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
                    var token = obj.name, ret = install( token, obj.args, obj.callback );
                    if( token.indexOf("@cb") === -1 ){
                        returns[ token ] = ret;
                        mapper[ token ].state = 2;
                        $.log('<code style="color:cyan;">已加载', token, '模块</code>', true);
                        $._checkDeps();
                    }
                }
            }
        },
        //定义模块
        define: function( name, deps, factory ){//模块名,依赖列表,模块本身
            var args = arguments;
            if( typeof deps === "boolean" ){//用于文件合并, 在标准浏览器中跳过补丁模块
                if( deps ){
                    return;
                }
                [].splice.call( args, 1, 1 );
            }
            if( typeof args[1] === "function" ){//处理只有两个参数的情况
                [].splice.call( args, 1, 0, "" );
            }
            args[2].token = "@"+name; //模块名
            this.require( args[1], args[2] );
        },
        //请求模块
        require: function( deps, factory, errback ){
            var _deps = {}, args = [], dn = 0, cn = 0, path = factory["@path"];
            (deps +"").replace($.rword,function( url, name, match){
                if(url.indexOf("./") === 0){
                    url = url.replace(/^\.\//, path );
                }else if(url.indexOf("../") === 0){ //by 一群 贵阳-Hodor(331492653)
                    for( url = path+url;  /\.\./.test( url ); url = url.replace(/\w+\/\.\.\//g,"") );
                }
                dn++;
                match = url.match( rmodule );
                name  = "@"+ match[1];//取得模块名
                if( !mapper[ name ] ){ //防止重复生成节点与请求
                    mapper[ name ] = { };//state: undefined, 未安装; 1 正在安装; 2 : 已安装
                    loadJS( name, match[2] );//将要安装的模块通过iframe中的script加载下来
                }else if( mapper[ name ].state === 2 ){
                    cn++;
                }
                if( !_deps[ name ] ){
                    args.push( name );
                    _deps[ name ] = "司徒正美";//去重，去掉@ready
                }
            });
            var token = factory.token || "@cb"+ ( cbi++ ).toString(32);
            if( dn === cn ){//如果需要安装的等于已安装好的
                var ret = install( token, args, factory )
                if( token.indexOf("@cb") === -1 ){
                    returns[ token ] = ret;
                    mapper[ token ].state = 2;
                    $.log('<code style="color:cyan;">已加载', token, '模块</code>', true);
                }
                return ret;//装配到框架中
            }
            if( errback ){
                errorStack( errback );//压入错误堆栈
            }
            mapper[ token ] = {//创建或更新模块的状态
                callback: factory,
                name:     token,
                deps:     _deps,
                args:     args,
                state:    1
            };//在正常情况下模块只能通过_checkDeps执行
            loadings.unshift( token );
            process.nextTick( $._checkDeps );
        },
        md5: function(str, encoding){
            return require('crypto').createHash('md5').update(str).digest(encoding || 'hex');
        },
        path: function(){
            return path.join.apply(null,arguments);
        },
        configs: {}
    });

    exports.$ = global.$ = $;
    $.log("<code style='color:green'>后端mass框架</code>",true);
  
    $.require("system/server", function(){
        $.log($.configs.port)
    });
//路由系统的任务有二
//到达action 拼凑一个页面，或从缓存中发送静态资源（刚拼凑好的页面也可能进入缓存系统）
//接受前端参数，更新数据库

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
