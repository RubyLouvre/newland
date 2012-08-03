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
    $.log("添加过滤器")
    $.ejs = function( str ){
        var ropen = /\s*<%\s*/
        var rclose = /\s*%>\s*/
        var rAt = /(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g
        var rlastSemi = /[,;]\s*$/
        var openHTML = "\t__views.push("
        var closeHTML = ");\n"
        var arr = (str||"").trim().split(ropen);
        var quote =  this.JSON ? JSON.stringify : $.quote;
        var buff = ["var __views = [];\n"];
        for(var i = 0, n = arr.length; i < n ; i++){
            var segment = arr[i];
            //  els = segment.split(rright);
            if( ~segment.indexOf( '%>') ){//这里不使用els.length === 2是为了避开IE的split bug
                var els = segment.split(rclose);
                switch ( els[0].charAt(0) ) {
                    case "="://处理后台返回的变量（输出到页面的);
                        var js = els[0].slice(1);
                        js = js.replace(rAt,"$1data.").replace(rlastSemi,'')
                        if(js.charAt(0) == ":"){
                            js = filtered(js)
                        }
                        buff.push( openHTML, js , closeHTML );
                        break;
                    case "#"://处理注释
                        break;
                    default://处理逻辑
                        js = els[0];
                        if(js.indexOf("@")!==-1){
                            buff.push( js.replace(rAt,"$1data."), "\n" );
                        }else{
                            buff.push( js, "\n" );
                        }
                }
                //处理静态HTML片断
                if( els[1]){
                    buff.push(openHTML, quote( els[1] ), closeHTML);
                }
            }else{
                //处理静态HTML片断
                segment && buff.push(openHTML, quote( segment ), closeHTML);
            }
        }
        return new Function("data", "helper",
            "data = data || {};\nhelper = helper || {};\n"+
            "with(helper){\n"
            + buff.join("")+'\t;return __views.join(""); \n}');
    }
    return $.ejs;
})
