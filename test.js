var http = require('http');

var options = {
    port: 5984,
    method: 'GET',
    path:"/_all_dbs"
};
var isUrl = /^https?:/
var $ = {};
var  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL

rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
rnoContent = /^(?:GET|HEAD)$/,
rquery = /\?/,
rurl =  /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
//dataType ,port, method, url, query, host, callback, data error timeout  url会分解
defaults  = {
    type:"GET",
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    async:true,
    jsonp: "callback"
};
//将data转换为字符串，type转换为大写，添加hasContent，crossDomain属性，如果是GET，将参数绑在URL后面
function setOptions( opts ) {
    opts = $.Object.merge( {}, defaults, opts );
    if (opts.crossDomain == null) { //判定是否跨域
        var parts = rurl.exec(opts.url.toLowerCase());
        opts.crossDomain = !!( parts &&
            ( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
                ( parts[ 3 ] || ( parts[ 1 ] === "http:" ?  80 : 443 ) )
                !=
                ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ?  80 : 443 ) ) )
            );
    }
    if ( opts.data && opts.data !== "string") {
        opts.data = $.param( opts.data );
    }
    // fix #90 ie7 about "//x.htm"
    opts.url = opts.url.replace(/^\/\//, ajaxLocParts[1] + "//");
    opts.type = opts.type.toUpperCase();
    opts.hasContent = !rnoContent.test(opts.type);//是否为post请求
    if (!opts.hasContent) {
        if (opts.data) {//如果为GET请求,则参数依附于url上
            opts.url += (rquery.test(opts.url) ? "&" : "?" ) + opts.data;
        }
        if ( opts.cache === false ) {//添加时间截
            opts.url += (rquery.test(opts.url) ? "&" : "?" ) + "_time=" + Date.now();
        }
    }
    return opts;
}
$.ajax = function(opts){
    opts.error = opts.error || function(){}
// opts.

}
//这个回调果真只有一个参数，即http.createServer(function(req, res) {})
var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    var body = ""
    res.on('data', function (chunk) {
        body += chunk
    });
    res.once("end", function(){
        var json = JSON.parse(body);
        console.log(json)
    })
});
req.end()
req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});
