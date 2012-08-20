$.define("session", "sessions/"+$.config.session.type ,function(fn){
    return function(flow){
        //劫持res.end方法
        
        if(flow.cookies){
            var res = flow.res;
            var end = res.end;
            res.end = function(data, encoding){
                $.log('<code style="color:cyan;">flow.fire("end")'+flow.originalUrl+'</code>', true);
                flow.fire("end")
                end.call(res, data, encoding);
            };
            fn(flow)
        }
    }
})
//202.8.19 此服务受限于get_cookie服务