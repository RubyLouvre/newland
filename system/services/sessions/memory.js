$.define("memory", function(){
    //它要在app上创建一个hash,
    var memory = $.memory ||  ($.memory = {});
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var sid in memory) {
            if ( memory[ sid ] && (!memory[ sid ].flow) && memory[ sid ].mtime < now){
                $.log("清洗过其sesiion : "+sid)
                delete memory[ sid ];
            }
        }
    }
    if(!memory.sweeping){
        memory.sweeping = true;
        sweep();
        // 每 24 分钟执行一次
        setInterval(sweep, 1440 * 1000);
    }
    return function( flow ){
        var s = $.config.session;
        var sid = flow.cookies[ s.sid ] || flow.uuid()
        var data = {}
        if( memory[ sid ] ){
            data = memory[ sid ].data || {}
            //如果数据还保存在内存中,把它取下来,防止被清掉
            delete memory[ sid ]
        }
        flow.store.open( s.life, data );
        //每次都重置sessionID的cookie
        flow.addCookie( s.sid, sid,{
            maxAge: s.life,
            httpOnly: true
        })
        flow.bind("end", function(){
            var store = flow.store
            store.mtime = Date.now() + store.life; //重设mtime;
            delete store.flow;
            $.memory[ sid ] = store; //将它放进$.memory,等待清理
        })
    }
});
