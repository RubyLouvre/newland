define( ["./httpflow", "http", "fs"], function( Flow, http, fs ){
    //var server_names = fs.readdirSync(__dirname +"/services");
   // console.log(server_names)



//    http.createServer(function(req, res) {
//        var flow = new Flow()//创建一个流程对象，处理所有异步操作，如视图文件的读取、数据库连接
//        flow.patch(req, res)
//        services.forEach(function(fn){
//            fn(flow);//将拦截器绑到流程对象上
//        });
//        if(req.method == "POST"){
//            var buf = "";//收集post请求的参数
//            req.setEncoding('utf8');
//            function buildBuffer(chunk){
//                buf += chunk
//            }
//            req.on('data', buildBuffer);
//            req.once('end',function(){
//                var url = req.url
//                if(buf !== ""){
//                    url += (/\?/.test( req.url ) ? "&" : "?")  + buf;
//                }
//                //重写method!
//                var match =  url.match(rmethod), method
//                if (match) {
//                    method = unescape(match[2])
//                } else if (req.headers['x-http-method-override']) {
//                    method = req.headers['x-http-method-override'];
//                }
//                if(method){
//                    req._method = "POST";
//                    req.method = method.toUpperCase();
//                }
//                router(flow, "POST", url)
//            })
//        }else{
//            router(flow, "GET", req.url)
//        }
//    }).listen( $.config.port );

})