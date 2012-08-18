$.define("get_cookie","../cookie", function(Cookie){
    return function( flow ){
        var config = $.config.cookie
        if ( flow.originalUrl.indexOf(config.path) == 0 ){
            var cookie = flow.req.headers.cookie;
            if (!cookie) {
                flow.cookies = {};
            }else{
                flow.cookies = Cookie.parse(cookie)
            }
            flow.fire("get_cookie",  Cookie );
        }
     
    }
});
//2012.8.19 用于在flow上添加cookies对象