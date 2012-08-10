$.define("home_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        //        index: function(flow){
        //            $.log("已进入home#index action")
        //            var view_url = $.path.join("app","views", "home","index.html" );
        //            flow.fire("get_view", view_url, flow.req.url )
        //        },
        show: function(flow){
            $.log("已进入home#show action")
            var view_url = $.path.join("app","views", "home","show.html" );
            flow.session.set("show","111111")
            flow.fire("get_view", view_url, flow.req.url )
        },
        tabs: function(flow){
            $.log("已进入home#index action")
            var view_url = $.path.join("app","views", "home","tabs.html" );
            flow.fire("get_view", view_url, flow.req.url )
        },
        ajax: function(flow){
            $.log("进入AJAX请求分支!")
            if(flow.xhr){
                var e = flow.params
                clearTimeout(flow.timeoutID)
                console.log(e);
                flow.res.writeHead(200, {
                    'content-type':'text/json'
                })
                flow.res.end(JSON.stringify(e))
            }

        }
    });
    $.controllers[ "home"] = new klass
});

