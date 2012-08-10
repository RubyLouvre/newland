$.define("session","../stores/memory", function( getSession ){

    return function(flow){
     
       
        if( flow._page ){
                $.log("已进入session栏截器")
            var opts = $.configs.session;
            var cookie = flow.cookie
            var sid = cookie.get(opts.sid);
            var session = getSession(sid, opts.life)
            flow.session = session;
            if( sid !== session._sid){
                $.log("没有sessionID则创建一个新的")
                flow.addCookie(opts.sid, session._sid )
            }
        }
    }
})

