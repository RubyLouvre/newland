$.define("session","../sessions/"+$.config.session.type ,function(fn){
    return function(flow){
        fn(flow)
    }
})