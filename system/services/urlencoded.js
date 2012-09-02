define( [ "querystring" ], function(qs){
    //这是必经的第一个服务
    return function( flow ){
        if ( !flow._body &&  flow.getHeader("content-type") == "application/x-www-form-urlencoded" ){
            flow._body = true;
            flow.body = {}  ;
            var buf = "";//收集post请求的参数
            var req = flow.req;
            req.setEncoding('utf8');
            function buildBuffer(chunk){
                buf += chunk
            }
            req.on('data', function(chunk){
                buf += chunk
            });
            req.on('end', function(){
                try {
                    flow.body = buf.length ? qs.parse(buf) : {};
                } catch (err){
                    flow.fire("send_error", 500, err);
                }
                flow.fire("method_override")
            });
        }else{
            flow.fire("method_override")
        }
    }
});
