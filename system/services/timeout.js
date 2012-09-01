define( function(){
    return function( flow ){
        var ms = $.config.timeout || 5000;
        var id = setTimeout(function(){
            flow.fire("send_error", 408, "Request timeout");
        }, ms);
        flow.bind('header', function(){
            clearTimeout(id);
        });
    }
})