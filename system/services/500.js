$.define("500", function(){
    return function( flow ){
        flow.bind('error_'+flow._id, function(){
            this.fire("send_error", 500);
        })
    }
});