+ function( global, DOC ){

    var
    _$ = global.$, //保存已有同名变量
    namespace = DOC.URL.replace( /(#.+|\W)/g,''),
    w3c = DOC.dispatchEvent, //w3c事件模型
    HEAD = DOC.head || DOC.getElementsByTagName( "head" )[0],
    commonNs = global[ namespace ], mass = 1, postfix = "",
    class2type = {
        "[object HTMLDocument]"   : "Document",
        "[object HTMLCollection]" : "NodeList",
        "[object StaticNodeList]" : "NodeList",
        "[object IXMLDOMNodeList]": "NodeList",
        "[object DOMWindow]"      : "Window"  ,
        "[object global]"         : "Window"  ,
        "null"                    : "Null"    ,
        "NaN"                     : "NaN"     ,
        "undefined"               : "Undefined"
    },
    toString = class2type.toString;

    /**
     * @class $
     * mass Framework拥有两个命名空间,
     * 第一个是DOC.URL.replace(/(\W|(#.+))/g,'')，根据页面的地址动态生成
     * 第二个是$，我们可以使用别名机制重写它
     */
    function $( expr, context ){//新版本的基石
        if( $.type( expr,"Function" ) ){ //注意在safari下,typeof nodeList的类型为function,因此必须使用$.type
            $.require( "lang,flow,attr,event,fx,ready", expr );
        }else{
            if( !$.fn )
                throw "@node module is required!"
            return new $.fn.init( expr, context );
        }
    }
    //多版本共存
    if( typeof commonNs !== "function"){
        commonNs = $;//公用命名空间对象
        commonNs.uuid = 1;
    }
    if(commonNs.mass !== mass  ){
        commonNs[ mass ] = $;//保存当前版本的命名空间对象到公用命名空间对象上
        if(commonNs.mass || (_$ && _$.mass == null)) {
            postfix = ( mass + "" ).replace(/\D/g, "" ) ;//是否强制使用多库共存
        }
    }else{
        return;
    }
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
    }

    mix( $, {//为此版本的命名空间对象添加成员
        html: DOC.documentElement,
        head: HEAD,
        mix: mix,
        cache: {},
        rword: /[^, ]+/g,
        mass: mass,//大家都爱用类库的名字储存版本号，我也跟风了
        "@bind": w3c ? "addEventListener" : "attachEvent",
        //将内部对象挂到window下，此时可重命名，实现多库共存  name String 新的命名空间
        exports: function( name ) {
            _$ && ( global.$ = _$ );//多库共存
            name = name || $[ "@name" ];//取得当前简短的命名空间
            $[ "@name" ] = name;
            global[ namespace ] = commonNs;
            return global[ name ]  = this;
        },
        /**
         * 数组化
         * @param {ArrayLike} nodes 要处理的类数组对象
         * @param {Number} start 可选。要抽取的片断的起始下标。如果是负数，从后面取起
         * @param {Number} end  可选。规定从何处结束选取
         * @return {Array}
         */
        slice: function ( nodes, start, end ) {
            var ret = [], n = nodes.length;
            if(end === void 0 || typeof end == "number" && isFinite(end)){
                start = parseInt(start,10) || 0;
                end = end == void 0 ? n : parseInt(end, 10);
                if(start < 0){
                    start += n;
                }
                if(end > n){
                    end = n;
                }
                if(end < 0){
                    end += n;
                }
                for (var i = start; i < end; ++i) {
                    ret[i - start] = nodes[i];
                }
            }
            return ret;
        },
        /**
         * 用于取得数据的类型（一个参数的情况下）或判定数据的类型（两个参数的情况下）
         * @param {Any} obj 要检测的东西
         * @param {String} str 可选，要比较的类型
         * @return {String|Boolean}
         */
        type: function ( obj, str ){
            var result = class2type[ (obj == null || obj !== obj ) ? obj :  toString.call( obj ) ] || obj.nodeName || "#";
            if( result.charAt(0) === "#" ){//兼容旧式浏览器与处理个别情况,如window.opera
                //利用IE678 window == document为true,document == window竟然为false的神奇特性
                if( obj == obj.document && obj.document != obj ){
                    result = 'Window'; //返回构造器名字
                }else if( obj.nodeType === 9 ) {
                    result = 'Document';//返回构造器名字
                }else if( obj.callee ){
                    result = 'Arguments';//返回构造器名字
                }else if( isFinite( obj.length ) && obj.item ){
                    result = 'NodeList'; //处理节点集合
                }else{
                    result = toString.call( obj ).slice( 8, -1 );
                }
            }
            if( str ){
                return str === result;
            }
            return result;
        },
        //$.log(str, showInPage=true, 5 )
        log: function (str){
            var  show = true, page = false
            for(var i = 1 ; i < arguments.length; i++){
                var el = arguments[i]
                if(typeof el == "number"){
                    show = el <=  $.log.level
                }else if(el === true){
                    page = true;
                }
            }
            if(show){
                if( page === true ){
                    $.require( "ready", function(){
                        var div =  DOC.createElement("pre");
                        div.className = "mass_sys_log";
                        div.innerHTML = str +"";//确保为字符串
                        DOC.body.appendChild(div)
                    });
                }else if( global.console ){
                    global.console.log( str );
                }
            }
        },
        //用于建立一个从元素到数据的引用，用于数据缓存，事件绑定，元素去重
        getUid: global.getComputedStyle ? function( node ){
            return node.uniqueNumber || ( node.uniqueNumber = commonNs.uuid++ );
        }: function( node ){
            if(node.nodeType !== 1){
                return node.uniqueNumber || ( node.uniqueNumber = commonNs.uuid++ );
            }
            var uid = node.getAttribute("uniqueNumber");
            if ( !uid ){
                uid = commonNs.uuid++;
                node.setAttribute( "uniqueNumber", uid );
            }
            return +uid;//确保返回数字
        },
        /**
         * 生成键值统一的对象，用于高速化判定
         * @param {Array|String} array 如果是字符串，请用","或空格分开
         * @param {Number} val 可选，默认为1
         * @return {Object}
         */
        oneObject : function( array, val ){
            if( typeof array == "string" ){
                array = array.match( $.rword ) || [];
            }
            var result = {}, value = val !== void 0 ? val :1;
            for(var i = 0, n = array.length; i < n; i++){
                result[ array[i] ] = value;
            }
            return result;
        }
    });
    $.log.level = 9;
    $.noop = $.error = $.debug = function(){};
    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList".replace( $.rword, function( name ){
        class2type[ "[object " + name + "]" ] = name;
    });

    +function(scripts, node){
        node = scripts[ scripts.length - 1 ];//FF下可以使用DOC.currentScript
        var url = node.hasAttribute ?  node.src : node.getAttribute( 'src', 4 );
        url = url.replace(/[?#].*/, '');
        $["@name"] = node.getAttribute("namespace") || "$"
        var str = node.getAttribute("debug")
        $["@debug"] = str == 'true' || str == '1';
        $.base = url.substr( 0, url.lastIndexOf('/') )
    }(DOC.getElementsByTagName( "script" ));

    var
    loadings = [],//正在加载中的模块列表
    errorStack = [],
    cbi = 1e5 ;//用于生成回调函数的名字
    var Module = function (id, parent) {
        this.id = id;
        this.exports = {};
        this.parent = parent;
        if (parent && parent.children) {
            parent.children.push(this);
        }
        this.filename = id;
        this.loaded = false;
        this.children = [];
    }
    Module.prototype.require = function(path) {
        return Module._load(path, this);
    };
    Module._load = function( url, parent) {
        var filename = Module._resolveFilename( url, parent.id )[0];
        var module = Module._cache[filename];
        if (module) {
            return module.exports;
        }
    };
    Module._resolveFilename = function(url, parent,ret, ext){
        if(/^(\w+)(\d)?:.*/.test(url)){  //如果用户路径包含协议
            ret = url
        }else {
            var tmp = url.charAt(0);
            if( tmp !== "." && tmp != "/"){  //相对于根路径
                ret = $.base +"/" +url;
            }else if(url.slice(0,2) == "./"){ //相对于兄弟路径
                ret = parent + "/" + url.substr(2);
            }else if( url.slice(0,2) == ".."){ //相对于父路径
                var arr = parent.replace(/\/$/,"").split("/");
                tmp = url.replace(/\.\.\//g,function(){
                    arr.pop();
                    return "";
                });
                ret = arr.join("/")+"/"+tmp;
            }
        }
        tmp = ret.replace(/[?#].*/, '');
        if(/\.(\w+)$/.test( tmp )){
            ext = RegExp.$1;
        }
        if(tmp == ret){//如果没有后缀名会补上.js
            ret += ".js";
            ext = "js";
        }
        return [ret, ext];
    }

    var modules = Module._cache = {
        "ready" : { }
    }
    $.modules = modules
    var rrequire = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g
    var rcomment  = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg
    var rparams =  /[^\(]*\(([^\)]*)\)[\d\D]*///用于取得函数的参数列表
    $.mix({
        //绑定事件(简化版)
        bind: w3c ? function( el, type, fn, phase ){
            el.addEventListener( type, fn, !!phase );
            return fn;
        } : function( el, type, fn ){
            el.attachEvent && el.attachEvent( "on"+type, fn );
            return fn;
        },
        unbind: w3c ? function( el, type, fn, phase ){
            el.removeEventListener( type, fn || $.noop, !!phase );
        } : function( el, type, fn ){
            if ( el.detachEvent ) {
                el.detachEvent( "on" + type, fn || $.noop );
            }
        },
        //file:///F:/phpnow/vhosts/ 
        path: function(parent, user, ret, ext){
            if(/^(\w+)(\d)?:.*/.test(user)){  //如果用户路径包含协议
                ret = user
            }else {
                var tmp = user.charAt(0);
                if( tmp !== "." && tmp != "/"){  //相对于根路径
                    ret = $.base +"/" +user;
                }else if(user.slice(0,2) == "./"){ //相对于兄弟路径
                    ret = parent + "/" + user.substr(2);
                }else if(user.slice(0,2) == ".."){ //相对于父路径
                    var arr = parent.replace(/\/$/,"").split("/");
                    tmp = user.replace(/\.\.\//g,function(){
                        arr.pop();
                        return "";
                    });
                    ret = arr.join("/")+"/"+tmp;
                }
            }
            tmp = ret.replace(/[?#].*/, '');
            if(/\.(\w+)$/.test( tmp )){
                ext = RegExp.$1;
            }
            if(tmp == ret){//如果没有后缀名会补上.js
                ret += ".js";
                ext = "js";
            }
            return [ret, ext];
        },
        //请求模块（依赖列表,模块工厂,加载失败时触发的回调）
        require: function( deps, factory, id ){
            var list = {}, // 用于检测它的依赖是否都为2
            args = [],      // 用于依赖列表中的模块的返回值
            dn = 0,         // 需要安装的模块数
            cn = 0;         // 已安装完的模块数
            //  console.log(deps)
            String(deps).replace( $.rword, function(el){
                var array = Module._resolveFilename(el, id || $.base), url = array[0]
                if(array[1] == "js"){
                    dn++
                    if( !modules[ url ] ){ //防止重复生成节点与请求
                        //state: undefined, 未安装; 1 正在安装; 2 : 已安装
                        loadJS( url );//将要安装的模块通过iframe中的script加载下来
                    }else if( modules[ url ].state === 2 ){
                        cn++;
                    }
                    if( !list[ url ] ){
                        args.push( url );
                        list[ url ] = "司徒正美";//去重
                    }
                }else if(array[1] === "css"){
                    loadCSS( url );
                }
            });
            id = id || "@cb"+ ( cbi++ ).toString(32)
            if( dn === cn ){//如果需要安装的等于已安装好的
                return install( id, args, factory );//装配到框架中
            }
            
            modules[ id ] = {//创建或更新模块的状态
                callback:factory,
                id: id,
                deps: list,
                args: args,
                state: 1
            };//在正常情况下模块只能通过_checkDeps执行
            loadings.unshift( id );
            $._checkDeps();//FIX opera BUG。opera在内部解析时修改执行顺序，导致没有执行最后的回调
        },
        //定义模块
        define: function( parent, deps, factory ){//模块名,依赖列表,模块本身
            var args = arguments;
            if( typeof deps === "boolean" ){//用于文件合并, 在标准浏览器中跳过补丁模块
                if( deps ){
                    return;
                }
                [].splice.call( args, 1, 1 );
            }
            if( typeof args[1] === "function" ){//处理只有两个参数的情况,补允依赖列表
                [].splice.call( args, 1, 0, [] );
            }
            var array = []
            args[2].toString().replace(rcomment,"") .replace(rrequire,function(a,b){
                array.push(b)
            })
            console.log(array)
            this.require( args[1], args[2], parent );
        },
        _checkFail : function(  doc, id, error ){
            doc && (doc.ok = 1);
            if( error || !modules[ id ].state ){
                this.log("Failed to load [[ "+id+" ]]");
            }
        },
        //检测此JS模块的依赖是否都已安装完毕,是则安装自身
        _checkDeps: function (){
            loop:
            for ( var i = loadings.length, id; id = loadings[ --i ]; ) {
                var obj = modules[ id ], deps = obj.deps;
                for( var key in deps ){
                    if( deps.hasOwnProperty( key ) && modules[ key ].state != 2 ){
                        continue loop;
                    }
                }
                //如果deps是空对象或者其依赖的模块的状态都是2
                if( obj.state != 2){
                    loadings.splice( i, 1 );//必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
                    install( obj.id, obj.args, obj.callback );
                    $._checkDeps();
                }
            }
        }
       
    });
    function loadCSS(url){
        
    }
    function loadJS( url, parent ){
        modules[ url ] = new Module( url, parent);
        var iframe = DOC.createElement("iframe"),//IE9的onload经常抽疯,IE10 untest
        codes = ['<script>var id ="', url, '", $ = {}, Ns = parent.', $["@name" ],
        '; $.define = ', innerDefine, ';var define = $.define<\/script><script src="',url,'" ><\/script>' ];
        iframe.style.display = "none";//opera在11.64已经修复了onerror BUG
        //http://www.tech126.com/https-iframe/ http://www.ajaxbbs.net/post/webFront/https-iframe-warning.html
        if( !"1"[0] ){//IE6 iframe在https协议下没有的指定src会弹安全警告框
            iframe.src = "javascript:false"
        }
        HEAD.insertBefore( iframe, HEAD.firstChild );
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.write( codes.join('') );
        doc.close();
    }

    var innerDefine = function(  ){
        var args = Array.apply([],arguments);
        if(typeof args[0] == "string"){
            args.shift()
        }
        args.unshift( id );  //劫持第一个参数,置换为当前JS文件的URL
        var module = Ns.modules[ id ];
        var last = args.length - 1;
        //劫持最后一个参数,将$, exports, require, module等对象强塞进去
        args[ last ] =  parent.Function( "$, module, require, exports","return "+ args[ last ] )
        (Ns, module, module.require, module.exports);
        //将iframe中的函数转换为父窗口的函数
        Ns.define.apply(Ns, args)
    }

    function install( id, deps, callback ){
        for ( var i = 0, array = [], d; d = deps[i++]; ) {
            array.push( modules[ d ].exports );//从returns对象取得依赖列表中的各模块的返回值
        }
        var module = Object( modules[id] ), ret;
        var common = {
            exports: module.exports,
            require: module.require,
            module:  module
        }
        var match = callback.toString().replace(rparams,"$1") || [];
        var a = common[match[0]];
        var b = common[match[1]];
        var c = common[match[2]];
        if( a && b && a != b && b != c  ){//exports, require, module的位置随便
            ret =  callback.apply(0, [a, b, c]);
        }else{
            ret =  callback.apply(0, array);
        }
        module.state = 2;
        if(typeof ret !== "undefined"){
            common.exports = ret;
        }
        console.log(ret)
        return ret;
    }
    //domReady机制
    var readyFn, ready =  w3c ? "DOMContentLoaded" : "readystatechange" ;
    function fireReady(){
        modules[ "ready" ].state = 2;
        //   $._checkDeps();
        if( readyFn ){
            $.unbind( DOC, ready, readyFn );
        }
        fireReady = $.noop;//隋性函数，防止IE9二次调用_checkDeps
    };
    function doScrollCheck() {
        try {
            $.html.doScroll( "left" ) ;
            fireReady();
        } catch(e) {
            setTimeout( doScrollCheck, 31 );
        }
    };

    if ( DOC.readyState === "complete" ) {
        fireReady();//如果在domReady之外加载
    }else {
        $.bind( DOC, ready, readyFn = function(){
            if ( w3c || DOC.readyState === "complete" ){
                fireReady();
            }
        });
        if( $.html.doScroll && self.eval === parent.eval)
            doScrollCheck();
    }
    var rdebug =  /^(init|constructor|lang|query)$|^is|^[A-Z]/;
    function debug (){}
    $.debug = function(name){
        if(!$["@debug"])
            return
        for( var i in $){
            debug($, i, name);
        }
        for( i in $.prototype){
            debug($.prototype, i, name,1);
        }
    }
    global.VBArray && ("abbr,article,aside,audio,bdi,canvas,data,datalist,details,figcaption,figure,footer," +
        "header,hgroup,mark,meter,nav,output,progress,section,summary,time,video").replace( $.rword, function( tag ){
        DOC.createElement(tag);
    });
    for(var i in $){
        if( !$[i].mass && typeof $[i] == "function"){
            $[i]["@debug"] = i;
        }
    }
    //https://developer.mozilla.org/en/DOM/window.onpopstate
    $.bind( global, "popstate", function(){
        namespace = DOC.URL.replace(/(#.+|\W)/g,'');
        $.exports();
    });
  
    // $.base += "/eee/dddd"
    $.exports( $["@name"]+  postfix );//防止不同版本的命名空间冲突
    $.require("./lang",function(){
        console.log( "xxxxxxxx")
    })
/*combine modules*/
// console.log($["@path"])


}( this, this.document );



