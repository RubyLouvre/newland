$.define("timeout", function(){
    return function( flow ){
        flow.timeoutID = setTimeout(function(){
            flow.fire("send_error", 408);
        }, $.configs.timeout);
        
        flow.bind("send_file", function(  ){
            clearTimeout(this.timeoutID);
        })
    }
})