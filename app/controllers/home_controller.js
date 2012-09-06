define( function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            //链式写法，同名cookie前者会覆盖后者的，前端只生成“aaa=2; bbb=1”
            if(flow.method == "POST"){
                $.log("这里是post请求")
                flow.redirect("direct")
            }
            if(flow.method == "GET" && flow.xhr){
                $.log(flow.xhr, "green")
                flow.rendered = true
                var res = flow.res
                res.setHeader('Content-Type',  "text/plain");
                var txt = "这是后端返回的"
                res.setHeader('Content-Length', Buffer.byteLength( txt, "utf8" ));
                res.end(txt)
            }
        },
        direct:function(){
            $.log("已进入home#direct action")
        },
        tabs: function(flow){
            $.log("已进入home#tabs action")
            var view_url = $.path.join("app","views", "home","tabs.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});

