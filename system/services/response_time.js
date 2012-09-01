define( function(){

    return function(flow){
        var start = new Date;
        flow.on('header', function(){
            var duration = new Date - start;
            this.setHeader('X-Response-time', duration + 'ms');
        });
    }
})