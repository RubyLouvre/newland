$.define("memory", function(){
    //它要在app上创建一个hash,
    var memory = $.memory ||  ($.memory = {});
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var sid in memory) {
            if ( memory[ sid ] && memory[ sid ].mtime < now){
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
        $.log('<code style="color:cyan;">已调用memory session服务</code>', true);
        //每次都重置sessionID的cookie
        flow.addCookie( s.sid, sid,{
            maxAge: s.life,
            httpOnly: true
        })
        flow.bind("end", function(){
            $.memory[ sid ] = {
                data: flow.session,
                mtime: Date.now() + s.life
            }; //将它放进$.memory,等待清理
            $.log('<code style="color:cyan;">已关闭memory session服务</code>', true);
        });
       
    }
});
