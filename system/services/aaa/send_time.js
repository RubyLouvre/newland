define( function(){
    //用于监听服务器一共花了多少时间响应这个请求
    return function(flow){
        if(!flow.response_time){
            flow.response_time = new Date
        }
        flow.bind("send_file", function( page ){
            var start = flow.response_time;
            delete  flow.response_time;
            var duration = new Date - start;
            flow.res.setHeader('X-Response-time', duration + 'ms');
        })
    }
})
