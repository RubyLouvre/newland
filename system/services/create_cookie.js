define( ["$cookie"], function(Cookie){
    return function( flow ){
        flow.bind("create_cookie", function(){
            var config = $.config.cookie;
            flow.cookies = {};
            if ( /^(\*|html)$/i.test(flow.mime) && flow.url.indexOf(config.path) == 0 ){
                $.log( "flow.cookies已经可用", "green", 6 );
                var cookie = flow.req.headers.cookie;
                try{
                    if(cookie.length){
                        flow.cookies = Cookie.parse(cookie)
                    }
                }catch(e){};
            }
            flow.fire("create_session");
        })
    }
});
// 2012.8.19 只有经过MVC的请求才能进入，同时也可减少session服务的无谓消防，提高性能