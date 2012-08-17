$.define("home_controller",function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            var view_url = $.path.join("app","views", "home","index.html" );
            flow.session.set("home","uuuu")
            flow.fire("get_view", view_url, flow.req.url )
        },
        tabs: function(flow){
            $.log("已进入home#tabs action")
            var view_url = $.path.join("app","views", "home","tabs.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});

