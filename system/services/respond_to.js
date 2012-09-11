define( ["../helper","../more/tidy","$ejs"], function(helper,tidy){

    return function(flow){
        flow.bind("respond_to", function( format, opts ){
            var url, res = flow.res, rext = /\.(\w+)$/, data;
            //如果没有指定，或第二个参数指定了location
            if( !opts  || typeof opts.location == "string" ){
                if( !opts ){ //如果是静态资源
                    url = $.path.join("app/public/",flow.pathname);
                }else {     //如果是从路由系统那里来的
                    url = $.path.join($.config.base, "app/views", opts.location + "."+ format);
                }
                opts = opts ||{};
                var ext = opts.ext || ".xhtml"
                $.ejs.data = {
                    links:   [],
                    scripts: []
                }
                if( /^(html|\*)$/.test(format) ){  //如果是页面
                    var cache = $.pagesCache[ url ];
                    var temp //用于保存ejs或html
                    if(!cache){//如果不存在,先尝试打模板
                        try{
                            temp = $.readFileSync( url.replace(rext,ext), "utf8");
                            temp = $.ejs.compile( temp, helper );//转换成编译函数
                            cache = $.pagesCache[ url ] =  temp
                        }catch(e){ }
                    }
                    if(!cache){//如果再不存在则找静态页面
                        cache = $.readFileSync( url ,"utf8");
                    }
                    if(!cache){//如果还是没有找到404
                        return flow.fire("send_error", 404, "找不到对应的页面", "html")
                    }
                 
                    format = "html";
                    if(typeof cache == "function"){
                        cache =  cache(opts || {}) ;//转换成页面
                        var context = $.ejs.data;
                        if(typeof context.layout == "string"){//如果它还要依赖布局模板才能成为一个完整页面,则找布局模板去
                            context.partial = cache;
                            var layout_url = $.path.join("app","views/layout", context.layout );
                            layout_url =  layout_url.replace(rext,ext);
                            cache = $.pagesCache[ layout_url ];
                            if( ! cache ){
                                try{
                                    temp  = $.readFileSync(layout_url, "utf8");
                                    cache = $.pagesCache[ layout_url ] = $.ejs.compile( temp, helper )
                                }catch(e){
                                    return flow.fire("send_error", 500, e, "html")
                                }
                            }
                            cache = cache( context );//这时已是完整页面了
                        }
                        data = tidy(cache)
                    }
                }
            }else{
                data = opts;//要返回给前端的数据
            }
            var mime = $.ext2mime( format );
            if( data && data.json && data.callback ){//返回JSONP形式的JS文件
                data = $.format("#{0}(#{1})", data.callback, JSON.stringify(data.json))
            }
            if( format == "json" ){//返回JSON数据
                data = JSON.stringify(data);
            }
            res.setHeader('Server',  "node.js "+ process.version);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('X-Powered-By', 'newland');
            var encoding  = /(^text|json$)/.test( mime )  ? "utf8" : "binary"
            if(encoding == "binary" || !data){
                var fs = require("fs");
                var util = require("util");
                //http://stackoverflow.com/questions/8445019/problems-with-sending-jpg-over-http-node-js
                fs.stat(url, function(err, stat) {
                    $.log("静态资源 : "+url,"green")
                    if(err){
                        flow.fire("send_error", 404, err);
                    }
                    var lastModified = stat.mtime.toUTCString();
                    var ifModifiedSince = "If-Modified-Since".toLowerCase();
                    if (!res.getHeader('ETag')) {
                        res.setHeader('ETag','"' + stat.size + '-' + Number(stat.mtime) + '"');
                    }
                    if (!res.getHeader('Date')){
                        res.setHeader('Date', new Date().toUTCString());
                    }

                    if (!res.getHeader('Cache-Control')){
                        res.setHeader('Cache-Control', 'public, max-age=' + (60 * 60 * 24 * 365));
                    }
                  
                    if (!res.getHeader('Last-Modified')){
                        res.setHeader("Last-Modified", lastModified);
                    }

                    var req = flow.req;
                    if ( req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
                        res.writeHead(304, "Not Modified");
                        return res.end();
                    }

                    res.writeHead(200, {
                        'Content-Type' :   flow.mime,
                        'Content-Length' : stat.size
                    });
                    var rs = fs.createReadStream(url);
                    // pump the file to the response
                    util.pump(rs, res, function(err) {
                        if(err) {
                            throw err;
                        }
                    });
                })
            }else{
                //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，
                //而要用new Date().toGMTString()，因为前者可能出现中文乱码
                //chrome 一定要发送Content-Type 请求头,要不样式表没有效果
                res.setHeader('Content-Type',  mime );
                //不要使用str.length，会导致页面等内容传送不完整 
                res.setHeader('Content-Length', Buffer.byteLength( data, "utf8" ));
                res.end(data, encoding);
            }
      


        })
    }
})
//添加对静态文件的输出读取支持
    //https://github.com/visionmedia/send
    //http://cnodejs.org/topic/4f5b47c42373009b5c04e9cb nodejs大文件下载与断点续传

    //@可乐 找到两个... 等会去试试 https://github.com/aadsm/jschardet
    //[杭州]Neekey<ni184775761@gmail.com> 20:32:43
    //https://github.com/mooz/node-icu-charset-detector

    //;(function(lazyIter, globals) {
    //  'use strict';
    //
    //  // Export the lazyIter object for Node.js and CommonJS.
    //  if (typeof exports !== 'undefined' && exports) {
    //    if (typeof module !== 'undefined' && module.exports) {
    //      exports = module.exports = lazyIter;
    //    }
    //    exports.lazyIter = lazyIter;
    //  } else if (typeof define === 'function' && define.amd) {
    //    // for AMD.
    //    define('lazyiter', function() {
    //      return lazyIter;
    //    });
    //  } else {
    //    (globals || Function('return this;')() || {}).lazyIter = lazyIter;
    //  }
    //
    //}(function() {
    //
    //  return lazyIter;
    //
    //}(), this));
