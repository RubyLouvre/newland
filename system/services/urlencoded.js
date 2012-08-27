define( [ "querystring" ], function(qs){
    //这是必经的第一个服务
    return function( flow ){
        flow.body = {};
        var req = flow.req;
        var str = req.headers['content-type'] || ''
        if(str.indexOf("application/x-www-form-urlencoded")!==-1){
            var buf = "";//收集post请求的参数
            req.setEncoding('utf8');
            function buildBuffer(chunk){
                buf += chunk
            }
            req.on('data', function(chunk){
                buf += chunk
            });
            req.on('end', function(){
                try {
                    req.body = buf.length ? qs.parse(buf) : {};
                } catch (err){}
                flow.fire("method_override")
            });
        }else{
            flow.fire("method_override")
        }
    }
});
