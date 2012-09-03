define( ["../helper","$ejs"], function(helper){
    function getFile(url, type){
        try{
            var encoding  = /^(css|js|txt|ejs|html|xhtml|xml)$/.test ? "utf8" : "binary"
            var temp = $.readFileSync( url,encoding );
            return $.pagesCache[ url ] = {
                data: temp,
                type: type
            }
        }catch(e){ }
    }
    return function(flow){
        flow.bind("respond_to", function( format, obj ){
            var url, res = flow.res, cache
            if(typeof format == "string"){
                url = $.path.join($.core.base, "app/views", flow._cname, flow._aname + "."+ format);
            }else {
                url = $.path.join("app/public/",flow.pathname);
            }
            $.log("flow.mime "+ flow.mime, "white", 7);
            $.ejs.data = {
                links:   [],
                scripts: []
            }
            if( flow.mime == "*" ){//如果是页面
                cache = $.pagesCache[ url ];
                var temp, html //用于保存ejs或html
                if(!cache){//如果不存在,先尝试打模板
                    try{
                        temp = $.readFileSync(url.replace(/\.html$/,".ejs"),"utf8");
                        temp = $.ejs.compile( temp, helper );//转换成编译函数
                        cache = $.pagesCache[ url ] = {
                            data: temp,
                            type: "ejs"
                        }
                    }catch(e){ }
                }
                if(!cache){//如果再不存在则找静态页面
                    cache = getFile( url, "html" );
                }
                if(!cache){//如果还是没有找到404
                    return flow.fire("send_error", 404, "找不到对应的视图", "html")
                }
                if(typeof cache.data == "function"){
                    html =  cache.data(obj || {}) ;//转换成页面
                    var context = $.ejs.data;
                    if(typeof context.layout == "string"){//如果它还要依赖布局模板才能成为一个完整页面,则找布局模板去
                        context.partial = html;
                        var layout_url = $.path.join("app","views/layout", context.layout );
                        cache = $.pagesCache[ layout_url ];
                        if( ! cache ){
                            try{
                                temp  = $.readFileSync(layout_url,"utf8");
                                cache = $.pagesCache[ layout_url ] = {
                                    data:  $.ejs.compile( temp, helper ),
                                    type: "ejs"
                                }
                            }catch(e){ 
                                return flow.fire("send_error", 500, e, "html")
                            }
                        }
                        html = cache.data( context );//这时已是完整页面了
                    }
                    cache = {
                        data: html,
                        type: "html"
                    }
                }
            }else{
                cache = $.pagesCache[ url ];
                if(!cache){
                    cache = getFile( url, flow.mime );
                }
                $.log("这里是输出其他请求资源 "+cache.type,"bg_blue",7);
            }
            var data = cache.data;//要返回给前端的数据
            if(data.type  === "json"){
                data = JSON.stringify(data);
            }
            res.setHeader('Content-Type',  flow.contentType(cache.type));
            //不要使用str.length，会导致页面等内容传送不完整
            res.setHeader('Server',  "node.js "+process.version);
            res.setHeader('Content-Length', Buffer.byteLength(data, "utf-8"));//binary
            $.log("==================","green",7)
            res.end(data);
        //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，
        //而要用new Date().toGMTString()，因为前者可能出现中文乱码
        //chrome 一定要发送Content-Type 请求头,要不样式表没有效果

        })
    }
})
//https://github.com/visionmedia/send
//http://cnodejs.org/topic/4f5b47c42373009b5c04e9cb nodejs大文件下载与断点续传