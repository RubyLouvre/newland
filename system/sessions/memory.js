$.define("memory", function(){
    //它要在app上创建一个hash,
    var memory = $.memory ||  ($.memory = {});
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var sid in memory) {
            if ( memory[sid] && !memory[sid].flow && memory[sid].mtime < now){
                delete memory[sid]
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
        var s = $.config.session, data = {};
        var sid = flow.cookies[ s.sid ];
        //如果数据还保存在内存中,把它取下来,防止被请掉
        if( sid && memory[ sid ] ){
            data = memory.data
            delete memory[ sid ]
        }else{
            sid = flow.uuid();
            flow.addCookie( s.sid, sid )
        }
        flow.store.open( sid, s.life, data );
    }
});
