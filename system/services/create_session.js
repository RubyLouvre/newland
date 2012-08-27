define( ["./sessions/" + $.config.session.type] , function(fn){//  
    return function(flow){
        flow.bind("create_session", function(){
            var res = flow.res;
            var end = res.end;
            res.end = function(data, encoding){
                $.log('flow.fire("end")'+flow.url,'cyan');
                flow.fire("end")
                end.call(res, data, encoding);
            };
            fn(flow)
        })
    }
})
//202.8.19 此服务受限于get_cookie服务