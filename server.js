var http = require("http");
var fs = require('fs');
var url = require('url');
var mime = require('./mime');
var router = require("./router").router
var matchAccept = function(accept,array){
    return array.some(function(el){
        return ~accept.indexOf(el)
    })
}
exports.start = function(){
    http.createServer(function(request, response) {
        var accept = request.headers.accept;
        var urls = url.parse(request.url);
        if(matchAccept(accept,"text/html,application/xhtml+xml,application/xml".split(",")) ){

            router(urls,request, response)
        }else{
            var pathname = urls.pathname;
            var ext = pathname.match(/(\.[^.]+|)$/)[0];//取得后缀名
            switch(ext){
                case ".css":
                case ".js":
                    fs.readFile("."+request.url, 'utf-8',function (err, data) {//读取内容
                        if (err) throw err;
                        response.writeHead(200, {
                            "Content-Type": mime.mimeType(ext)
                        });
                        response.write(data);
                        response.end();
                    });
                    break;
            }
        }

    }).listen(8888);
    console.log("server start in localhost:8888...");
}


