$.define("ejs", "lang",function(){
    //用法如如ASP，JSP，ruby的ERB, 完全没有入门难度
    //不过太过自由写意，让用户任意在HTML镶嵌逻辑容易造成维护灾难
    //使用者请自行约束
    //http://www.cnblogs.com/rubylouvre/archive/2012/03/19/2405867.html
    function filtered(js) {
        return js.substr(1).split('|').reduce(function(js, filter){
            var parts = filter.split(':')
            , name = parts.shift()
            , args = parts.shift() || '';
            if (args) args = ', ' + args;
            return '$.ejs.filters.' + name + '(' + js + args + ')';
        });
    };
    $.ejs = function( id,data,doc){
        var el, source
        if( !this.cache[ id] ){
            doc = doc || document;
            el = $.query ? $(id, doc)[0] : doc.getElementById(id.slice(1));
            if(! el )
                throw "can not find the target element";
            source = el.innerHTML;
            if(!(/script|textarea/.test(el.tagName))){
                source = $.String.unescapeHTML(source);
            }
            var fn = $.ejs.compile( source );
            this.cache[ id ] = fn;
        }
        return this.cache[ id ]( data );
    }
    var isNodejs = typeof exports == "object";
    $.ejs.cache = {};
    $.ejs.filters = {};
    $.ejs.compile = function( source, opts){
        opts = opts || {}
        var open  = opts.open  || isNodejs ? "<%" : "<&";
        var close = opts.close || isNodejs ? "%>" : "&>";
        var flag = true;//判定是否位于前定界符的左边
        var codes = []; //用于放置源码模板中普通文本片断
        var time = new Date * 1;// 时间截,用于构建codes数组的引用变量
        var prefix = " r += s"+ time +"[" //渲染函数输出部分的前面
        var postfix = "];"//渲染函数输出部分的后面
        var t = "return function(data){ var r = ''; ";//渲染函数的最开始部分
        var rAt = /(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g;
        var rlastSemi = /[,;]\s*$/;
        var pre = 0, cur, code
        for(var i = 0, n = source.length; i < n; ){
            cur = source.indexOf( flag ? open : close, i);
            if( cur < pre){
                if( cur ){//取得最末尾的HTML片断
                    t += prefix + codes.length + postfix
                    codes.push( source.slice( pre ) );
                }else{
                    $.error("发生错误了");
                }
                break;
            }
            code = source.slice(i, cur );//截取前后定界符之间的片断
            pre = cur;
            if( flag ){//取得HTML片断
                t += prefix + codes.length + postfix;
                codes.push( code );
                i = cur + open.length;
            }else{//取得javascript罗辑
                switch(code.charAt(0)){
                    case ":"://使用过滤器的输出
                        code = code.replace(rAt,"$1data.").replace(rlastSemi,'');
                        code = filtered(code);
                    case "="://直接输出
                        t += " r +" +code +";"
                        break;
                    case "#"://注释,不输出
                        break
                    default://普通逻辑,不输出
                        t += code.replace(rAt,"$1data.");
                        break
                }
                i = cur + close.length;
            }
            flag = !flag;
        }
        t += " return r;}"
        // console.log(t)
        return Function("s"+time, "filters", t)(codes, $.ejs.filters)
    }

    return $.ejs;
})



