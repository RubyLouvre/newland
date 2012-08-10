$.define("session","../stores/memory", function( getSession ){

    return function(flow){
      
        flow.bind("session", function(){
            var opts = $.configs.session;
            var cookie = flow.cookie 
            var obj = cookie.get();
            if(obj.sid == "undefined"){
                delete obj.sid
            }
            var session = getSession(obj.sid, opts.life)
            flow.session = session;
        //    flow.removeCookie(opts.key )
        })
    }
})

