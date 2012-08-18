$.define("memory_session", function(){
    //它要在app上创建一个hash,
    var memory = $.memory ||  ($.memory = {});
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var key in memory) {
            if (typeof memory[key] == "object" && memory[key].timestamp < now){
                delete memory[key]
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
        flow.bind("get_cookie", function( ){
            var s = $.config.session
            var sid = flow.cookies[ s.sid ];
            var data = sid ? memory[ sid ] : memory[ flow.uuid() ]
            if( !sid ){
                flow.res.setHeader("Set-Cookie", sid+"="+flow.uuid)
            }
            flow.session.open( s.life, data );
        })
    }
});

