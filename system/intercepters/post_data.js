$.define("post_data","querystring", function(qs){
    return function( flow ){
        flow.bind("post_data", function(  ){
            var buf = '';
            req.setEncoding('utf8');
            function buildBuffer(chunk){
                buf += chunk
            }
            flow.receiving_data = true;
            req.on('data', buildBuffer);
            req.once('end',function(){
                try {
                    if(buf != ""){
                        flow.params  || (flow.params = {}) ;
                        $.mix(flow.params, qs.parse(buf))
                        flow.receiving_data = false;
                        flow.fire("post_data_end")
                    }
                    req.emit("next_intercepter",req,res)
                } catch(e){}
            })
        })
    }
});


