$.define("timeout", function(){
    return function( flow ){
        flow.timeoutID = setTimeout(function(){
            $.log("timeout : "+$.configs.timeout)
            flow.fire("send_error", 408);
        }, $.configs.timeout);

    }
})