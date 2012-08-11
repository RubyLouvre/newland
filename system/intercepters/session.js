$.define("session","../stores/memory", function( getSession ){

    return function(flow){
        if( flow._page ){
            $.log("已进入session栏截器")
            var opts = $.configs.session;
            var cookie = flow.cookie;
            var sid = cookie.get(opts.sid);
            if(Array.isArray(sid )){
                sid = sid[0]
            }
            var session = getSession(sid, opts.life)
            $.log("old_sid : "+sid)
            $.log("new_sid : "+session._sid)
            flow.session = session;
            flow.flash = function(type, msg) {
                var arr, msgs;
                msgs = this.session.flash || (this.session.flash = {});
                if (type && msg) {//保存消息
                    return msgs[type] = String(msg);
                } else if (type) {//取得消息
                    arr = msgs[type];
                    delete msgs[type];
                    return String(arr || "");
                } else {
                    this.session.flash = {};
                    return msgs;
                }
            }
            if( sid !== session._sid){
                $.log("没有sessionID则创建一个新的")
                flow.addCookie(opts.sid, session._sid )
            }
        }
    }
})

