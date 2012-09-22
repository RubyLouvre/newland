define( function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            //链式写法，同名cookie前者会覆盖后者的，前端只生成“aaa=2; bbb=1”
            if(flow.method == "POST" && !flow.xhr){
                flow.redirect("direct")
            }
            if(flow.method == "POST" && flow.xhr){
                flow.render("json",{
                    name:"司徒正美",
                    type:"post_json",
                    time: Date.now()
                })
            }
            if(flow.method == "GET" && flow.xhr){
             
                if(flow.mime == "json"){
                    flow.render("json",{
                        name:"司徒正美",
                        type:"jsonp",
                        time: Date.now()
                    })
                }else{
                    flow.render("txt","这是后端返回的")
                }
              
            }


        //            if(flow.method == "GET" && flow.params.callback){
        //                flow.render("js",{
        //                    json:{
        //                        name:"司徒正美",
        //                        type:"jsonp",
        //                        time: Date.now()
        //                    },
        //                    callback: flow.params.callback
        //                })
        //            }
         
        },
        aaa:function(){
            $.log("已进入home#aaa action")
        },
        bbb:function(){
            $.log("已进入home#bbb action")
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

