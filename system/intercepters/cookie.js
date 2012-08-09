$.define("cookie","../cookie", function(Cookie){
    return function(flow){
        flow.cookie = new Cookie(this.req, this.res);
    }
})


 