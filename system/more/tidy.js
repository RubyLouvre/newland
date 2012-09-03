define( ["./tidy_css","./tidy_html","./tidy_js"], function(tidy_css,tidy_html,tidy_js){
    return function(html){
        var matchAll = /<pre(?:.)+?class\s*=\s*([\'\"])\s*brush\b(?:.|\n|\r)+?\1\s*>(?:.|\n|\r)+?<\/pre>/gi
        var matchOne = /<pre class="brush:(\w+)(?:[^"]+)">((?:.|\n|\r)+?)<\/pre>/i
        var buffer = []
        html = html.replace(matchAll, function(ss){
            var match = ss.match(matchOne)
            var type = match[1];
            var context = match[2];
            switch(type){//对付语法高亮部分
                case "javascript":
                case "js":
                    context = tidy_js(context);
                    break;
                case "html":
                case "xml":
                    context = tidy_html(context);
                    break;
                case "css":
                    context = tidy_css(context);
                    break;
            }
            buffer.push( context )
            return '<pre class="brush:'+type+';gutter:false;toolbar:false">mass_mass</pre>'
        });
        html = tidy_html(html);
        if(buffer.length){
            var index = 0
            html = html.replace(/mass_mass/g, function(s){
                return "\n"+buffer[index++]+"\n"
            });
        }
        return html
    }
});

//http://www.w3.org/html/ig/zh/wiki/Contributions#bugs
//http://yiminghe.iteye.com/blog/618432

//doTaskList = function(dataList, doAsync, callback){
//    dataList = dataList.slice();
//    var ret = [];
//    var next = function(){
//        if(dataList.length < 1)
//            return callback(null, ret)
//        var d = dataList.shift();
//        try{
//            doAsync(d, function(err,data){
//                if(err)
//                    return callback(err);
//                ret.push(data);
//                next();
//            })
//        }catch(err){
//            return callback(err)
//        }
//    }
//    next();
//}