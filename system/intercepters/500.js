$.define("500", function(){
    return function( flow ){
        flow.bind('__error__', function(){
            this.fire("send_error", 500);
        })
    }
});