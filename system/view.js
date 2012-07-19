$.define("view", "./ejs, fs", function(ejs, fs){
    return function view( res, data, flow, opts){
        try{
            //=====================局部模板部分==========================
            var url = opts.url, fn = $.viewsCache[  url ]
            if( !fn ){
                var text =  fs.readFileSync( url,  'utf-8');
                fn =  $.viewsCache[ url ] = $.ejs( text );
            }
            text = fn.call(data, opts.data);
            //======================全局模板部分===========================
            if(typeof data.layout == "string"){
                data.partial = text
                url = $.path("app","views/layout", data.layout ), fn = $.viewsCache[  url ];
                if( !fn ){
                    text =  fs.readFileSync( url,  'utf-8');
                    fn =  $.viewsCache[ url ] = $.ejs( text );
                }
                text = fn.call(data, opts.data);
            }
            //http://jsfiddle.net/js2zF/4/
            $.log('<code style="color:', (opts.status == 200 ? "green" : "red"),'">', text,"</code>", true);
            if( opts.cachePage && /\.(css|js|png|jpg|html|gif)$/.test(opts.cacheKey)  ){
                url = opts.cacheKey
                $.pagesCache[ url ] = {
                    data: text,
                    contentType:opts.contentType,
                    status: opts.status
                }
                console.log("保存到缓存系统中")
                //https://github.com/ryanmcgrath/wrench-js/blob/master/lib/wrench.js
            }
            //unlink只能删除文件，如果对象是目录，则报EPERM（操作不许可）错误。
            //redir只能删除空目录，如果对象是文件，则报UNKNOWN报错，如果是非空目录，则报ENOTEMPTY错误。
            res.writeHead(opts.status, {
                "Content-Type":  opts.contentType
            });
            res.write( text );
            res.end();
        }catch(e){
            $.log('<code style="color:red">', e ,'</code>', true);
            flow.fire("404")
        }
    }
   
})

