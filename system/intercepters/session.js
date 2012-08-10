$.define("session","../stores/memory", function( getSession ){

    function uuid (len){
        var id = '', i = 0, j = (len || 16) | 0;
        for (; i < j; i++) id += Math.floor(Math.random()*16.0).toString(16);
        return id;
    };

    return function(flow){
        flow.bind("session", function(){
            var opts = $.configs.session;
            var cookie = flow.cookie || {};
            var sid = cookie[opts.key];
            var session = getSession(sid, opts.life)
            flow.session = session
            flow.setHeader("Set-Cookie",opts.key+"="+ session._sid )
        })
    }
})

