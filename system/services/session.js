$.define("session","../cookie,../stores/"+$.config.session.store, function(Cookie, Store ){
    return function(flow){
        if( flow._page ){
            $.log("已进入session栏截器")

            var cookie = flow.req.headers.cookie;
            var opts = $.config.session;
            var life  = opts.life;
            $.dbs = $.dbs || {};
            flow.session = flow.session || {};
            flow.cookie = new Cookie( cookie );
            var sid = flow.cookie.get(opts.sid);
            console.log("old "+sid)
            //使用Deferred模式,延迟到连接上数据后才操作它们,并改上这四个方法
            String("set,get,clear,remove").replace($.rword, function(name){
                flow.session[ "_" + name ] = [];
                flow.session[ name ] = function(){
                    this[ "_" + name ].push(  arguments );
                }
            });

            flow.bind("open_session_"+flow.id, function(session){
                //set,get,remove,clear等事件必须在open操作之后才能执行!
                String("set,get,remove,clear").replace($.rword, function(name){
                    var type =  name+"_session_"+flow.id;
                    var array = flow.session[ "_" + name ];
                    console.log(type)
                    function tmp(){
                        var args = $.slice(arguments);
                        args.unshift( type );
                        flow.fire.apply(flow, args)
                    }
                    flow.bind(type+",open_session_"+flow.id, session[name]);
                    for(var el; el = array.shift();){
                        tmp.apply(null, el)
                    }
                    flow.session[ name ] = tmp;
                });
                if( sid !== session.sid){
                    flow.addCookie(opts.sid, session.sid )
                }
            });

            if(Array.isArray(sid )){
                sid = sid[0]
            }
            new Store(sid, life, flow);
            
            flow.flash = function(type, msg, callback){
                var args = $.slice(arguments);
                if(typeof args[args.length - 1] === "function"){
                    callback = args.pop()
                }
                switch(args.length){
                    case 2:
                        flow.fire("set_session_"+flow.id, "flash."+ type, msg, callback);
                        break;
                    case 1:
                        flow.fire("get_session_"+flow.id, "flash."+ type,  callback);
                        break;
                    case 0:
                        flow.fire("remove_session_"+flow.id, "flash",  callback);
                        break;
                }
            }
        }
    }
})

