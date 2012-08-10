$.define("timeout", function(){
    return function( flow ){
        flow.timeoutID = setTimeout(function(){
            if(this.timeoutID){
                flow.fire("send_error", 408);
            }
        }, $.configs.timeout);
        
        flow.bind("send_file", function(  ){
            clearTimeout(this.timeoutID);
            delete this.timeoutID
        })
    }
})