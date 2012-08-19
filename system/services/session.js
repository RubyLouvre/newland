$.define("session","../sessions/"+$.config.session.type ,function(fn){
    return function(flow){
        if(flow.cookies){
            fn(flow)
        }
    }
})
//202.8.19 此服务受限于get_cookie服务