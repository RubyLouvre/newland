$.define("cookie", function(){
    //从cookie中取得加密了的sessionID的值,然后去掉过期时间,转换成一个对象
    //https://github.com/caolan/cookie-sessions/blob/master/lib/cookie-sessions.js
    //缺点是,可以储存的东西太少了
    return function( flow ){
        var s = $.config.session
        var sval = flow.cookies[ s.sid ]
        var data = {}
        if( typeof sval ==="string"  &&  sval[0] == "{" && sval.substr(-1,1) == "}" ){
            try{
                data =  JSON.parse(sval) 
            }catch(e){}
        }
        flow.store.open( s.life, data );
        flow.bind("before_header", function(){
            flow.addCookie( s.sid, JSON.stringify(flow.session),{
                maxAge: s.life,
                httpOnly: true
            })
        })
      
    }
});