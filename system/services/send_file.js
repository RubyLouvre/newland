define( function(){
    return function(flow){
        flow.bind("send_file", function( page ){
            $.log( "已调用send_file服务",6 );
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
