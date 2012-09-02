define( function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            //链式写法，同名cookie前者会覆盖后者的，前端只生成“aaa=2; bbb=1”
            if(flow.method == "POST"){
                console.log("这里是post请求")
                console.log(flow.body)
                console.log(flow.files)
                flow.render(flow.body)
            }
        //   console.log(flow.body)
        },
        tabs: function(flow){
            $.log("已进入home#tabs action")
            var view_url = $.path.join("app","views", "home","tabs.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});

