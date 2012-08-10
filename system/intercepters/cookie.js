$.define("cookie","../cookie", function(Cookie){
    return function(flow){
        flow.cookie = new Cookie(flow.req, flow.res);
    }
})


 