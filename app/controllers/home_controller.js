$.define("home_controller",function(){
    return {
        index: function(flow){
            $.log("已进入home#index action")
            var view_url = $.path.join("app","views", "home","index.html" );
           
            flow.addCookie("myCookie","xxxxxxxxxx");
            flow.addCookie("newCookie","ddd");
            //下面两个uuer不会相互覆盖的
            flow.res.setHeader("Set-Cookie","uuer=aa")
            flow.res.setHeader("Set-Cookie","uuer=yyy")
            flow.removeCookie("oldCookie")

            flow.fire("get_view", view_url, flow.req.url )
        },
        tabs: function(flow){
            $.log("已进入home#tabs action")
            var view_url = $.path.join("app","views", "home","tabs.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});

