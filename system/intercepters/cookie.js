$.define("cookie","../cookie", function(Cookie){
    return function(flow){
      //  $.log("已进入cookie栏截器")
        flow.cookie = new Cookie(flow.req, flow.res);
    }
})


 