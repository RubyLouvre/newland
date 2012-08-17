$.define("session","../cookie,../stores/"+$.configs.session.store, function(Cookie, Store ){
    return function(flow){
        if( flow._page ){
            $.log("已进入session栏截器")
            flow.cookie = new Cookie(flow.req);

            var opts = $.config.session;
            var cookie = flow.cookie;
            var life  = opts.life;
            var sid = cookie.get(opts.sid);

            if(Array.isArray(sid )){
                sid = sid[0]
            }

            new Store(sid, life, flow);

            flow.bind("open_session_"+flow._id, function(session){
                if( sid !== session._id){
                    flow.addCookie(opts.sid, session._sid )
                }
            });

            flow.flash = function(type, msg, callback){
                var args = $.slice(arguments);
                if(typeof args[args.length - 1] === "function"){
                    callback = args.pop()
                }
                switch(args.length){
                    case 2:
                        flow.fire("set_session_"+flow._id, "flash."+ type, msg, callback);
                        break;
                    case 1:
                        flow.fire("get_session_"+flow._id, "flash."+ type,  callback);
                        break;
                    case 0:
                        flow.fire("remove_session_"+flow._id, "flash",  callback);
                        break;
                }
            }
        }
    }
})

