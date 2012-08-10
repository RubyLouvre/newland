$.define("cookie","../cookie", function(Cookie){
    return function(flow){
        $.log("cccccccccccc")
        flow.cookie = new Cookie(flow.req, flow.res);
    }
})


 