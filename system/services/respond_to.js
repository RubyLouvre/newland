define( ["../helper","$ejs"], function(helper){
    function getFile(url, type){//可以是字符串或flow对象
        try{
            var mime = typeof type == "string" ? type : type.mime
            var encoding  = /(^text|json$)/.test( mime )  ? "utf8" : "binary"
            var temp = $.readFileSync( url,encoding );
            return $.pagesCache[ url ] =  temp
        }catch(e){ }
    }
    return function(flow){
        flow.bind("respond_to", function( format, opts ){
            opts = opts ||{};
            var ext = opts.ext || ".ejs"
            var url, res = flow.res, cache;
            var rext = /\.(\w+)$/;
            if(typeof format == "string"){
                url = $.path.join($.core.base, "app/views", flow._cname, flow._aname + "."+ format);
            }else {
                url = $.path.join("app/public/",flow.pathname);
            }
            $.ejs.data = {
                links:   [],
                scripts: []
            }
            if( flow.mime == "*" ){//如果是页面
                cache = $.pagesCache[ url ];
                var temp, html //用于保存ejs或html
                if(!cache){//如果不存在,先尝试打模板
                    try{
                        temp = $.readFileSync( url.replace(rext,ext), "utf8");
                        temp = $.ejs.compile( temp, helper );//转换成编译函数
                        cache = $.pagesCache[ url ] =  temp
                    }catch(e){ }
                }
                if(!cache){//如果再不存在则找静态页面
                    cache = getFile( url, "text/html" );
                }
                if(!cache){//如果还是没有找到404
                    return flow.fire("send_error", 404, "找不到对应的视图", "html")
                }
                flow._mime = "text/html"
                if(typeof cache == "function"){
                    html =  cache(opts || {}) ;//转换成页面
                    var context = $.ejs.data;
                    if(typeof context.layout == "string"){//如果它还要依赖布局模板才能成为一个完整页面,则找布局模板去
                        context.partial = html;
                        var layout_url = $.path.join("app","views/layout", context.layout );
                        layout_url =  layout_url.replace(rext,ext)
                        
                        cache = $.pagesCache[ layout_url ];
                        if( ! cache ){
                            try{
                                temp  = $.readFileSync(layout_url,"utf8");
                                cache = $.pagesCache[ layout_url ] = $.ejs.compile( temp, helper )
                            }catch(e){
                                return flow.fire("send_error", 500, e, "html")
                            }
                        }
                        html = cache( context );//这时已是完整页面了
                    }
                    cache = html;
                }
            }else{
                cache = $.pagesCache[ url ]
                if( !$.pagesCache[ url ] ){
                    var _ext = url.match( rext )[1];
                    cache = $.pagesCache[ url ] = getFile( url, $.contentType( _ext ) );
                }
            }
            var data = cache;//要返回给前端的数据
            if(flow.mime  === "application/json" ){
                data = JSON.stringify(data);
            }
            res.setHeader('Content-Type',  flow.mime );
            //不要使用str.length，会导致页面等内容传送不完整
            res.setHeader('Server',  "node.js "+ process.version);
            var encoding  = /(^text|json$)/.test( flow.mime )  ? "utf8" : "binary"

            res.setHeader('Content-Length', Buffer.byteLength( data, encoding ));
            res.end(data);
        //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，
        //而要用new Date().toGMTString()，因为前者可能出现中文乱码
        //chrome 一定要发送Content-Type 请求头,要不样式表没有效果

        })
    }
})
//https://github.com/visionmedia/send
//http://cnodejs.org/topic/4f5b47c42373009b5c04e9cb nodejs大文件下载与断点续传

//@可乐 找到两个... 等会去试试 https://github.com/aadsm/jschardet
//[杭州]Neekey<ni184775761@gmail.com> 20:32:43
//https://github.com/mooz/node-icu-charset-detector
