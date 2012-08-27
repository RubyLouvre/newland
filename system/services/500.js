define("500", function(){
    return function( flow ){
        flow.bind('error_'+flow.id, function(){
            this.fire("send_error", 500);
        })
    }
});