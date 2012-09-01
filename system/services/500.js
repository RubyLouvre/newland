define("500", function(){
    return function( flow ){
        flow.bind('error_'+flow.id, function(error){
            this.fire("send_error", 500, error);
        })
    }
});