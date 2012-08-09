$.define("send_file", function(){
    return function(flow){
        flow.bind("send_file", function( page ){
            //  $.log( "已进入send_file栏截器" );
            clearTimeout(this.timeoutID)
            var headers =  page.headers || {}
            $.mix(headers, {
                "Content-Type": page.type,
                "mass-mime" :"page.mine"
            });
            this.res.writeHead(page.code, headers);
            this.res.write(page.data);
            this.res.end();
        }.bind(flow))
    }
})
