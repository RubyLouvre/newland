$.define("get_cookie","../cookie", function(Cookie){
    return function( flow ){
        var config = $.config.cookie
        if ( /^(\*|html)$/i.test(flow.mime) && flow.originalUrl.indexOf(config.path) == 0 ){
            $.log( "已调用get_cookie服务" );
            var cookie = flow.req.headers.cookie;
            flow.cookies = cookie ?  Cookie.parse(cookie) : {}
        }
    }
});
// 2012.8.19 只有经过MVC的请求才能进入，同时也可减少session服务的无谓消防，提高性能