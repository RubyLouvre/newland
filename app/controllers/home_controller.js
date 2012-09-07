define( function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            //链式写法，同名cookie前者会覆盖后者的，前端只生成“aaa=2; bbb=1”
            if(flow.method == "POST"){
                flow.redirect("direct")
            }
  
            console.log(flow.mime)
            if(flow.method == "GET" && flow.xhr){
                flow.render("txt","这是后端返回的")
            }
            if(flow.mime == "json"){
                console.log("xxxxxxxxxxxxxxxx")
                flow.render("json",{
                    name:"司徒正美",
                    type:"jsonp",
                    time: Date.now()
                })
            }
            if(flow.method == "GET" && flow.params.callback){
                flow.render("js",{
                    json:{
                        name:"司徒正美",
                        type:"jsonp",
                        time: Date.now()
                    },
                    callback: flow.params.callback
                })
            }
         
        //   if(flow.method == "GET" && flow.xhr){
        //    flow.render("txt","这是后端返回的")
        //    }
        //   callback
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

