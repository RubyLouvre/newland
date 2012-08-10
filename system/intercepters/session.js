$.define("session","../stores/memory", function( getSession ){

    return function(flow){
      
       // flow.bind("session", function(){
            var opts = $.configs.session;
            console.log("====================")
            var cookie = flow.cookie
            var obj = cookie.get();
            var session = getSession(obj.sid, opts.life)
            flow.session = session;
            if( !obj.sid ){
                $.log("没有sessionID则创建一个新的")
                flow.removeCookie(opts.key,session._sid )
            }
     //   })
    }
})

