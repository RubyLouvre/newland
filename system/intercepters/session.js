$.define("session","../stores/memory", function( getSession ){

    return function(flow){
      
        flow.bind("session", function(){
            var opts = $.configs.session;
            var cookie = flow.cookie || {};
            var sid = cookie[opts.key];
            var session = getSession(sid, opts.life)
            flow.session = session;
            var c =  flow.res.getHeader("Set-Cookie");
            console.log(c)
            flow.addCookie(opts.key, session._sid )
        })
    }
})

