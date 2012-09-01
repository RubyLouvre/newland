define( ["./sessions/" + $.config.session.type] , function(fn){//

    $.log( "flow.cookies已经可用", "green", 6 );
    var Store = function(flow){
        this.mtime = Date.now()
        this.flow = flow;
    }
    Store.prototype = {
        open: function(life, data){
            this.data = this.flow.session  = data;
            this.mtime = Date.now() + life;
            $.log('fire open_session', "green", 6);
            this.flow.fire("open_session");
        }
    }

    return function(flow){
        flow.bind("create_session", function(){
            var res = flow.res;
            var end = res.end;
            flow.store = new Store(flow)
            res.end = function(data, encoding){
                $.log("响应完成","cyan",7);
                flow.fire("end")
                end.call(res, data, encoding);
            };
            fn(flow)
        })
    }
})
//202.8.19 此服务受限于get_cookie服务