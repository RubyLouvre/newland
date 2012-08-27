define( function(){
    //这是必经的第二个服务
    return function( flow ){
        flow.bind("method_override", function(){
            var req = flow.req;
            flow.originalMethod = flow.method = req.method;
            var key = $.config.method || "_method"
            if (flow.body && key in flow.body) {
                flow.method = flow.body[key].toUpperCase();
                delete flow.body[key];
                // check X-HTTP-Method-Override
            } else if (req.headers['x-http-method-override']) {
                flow.method = req.headers['x-http-method-override'].toUpperCase();
            }
            flow.fire("route_dispatch")
        })
    }
})
