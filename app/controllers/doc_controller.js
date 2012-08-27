define( function(){
    return {
        index: function(flow){
            $.log("已进入doc#index action");
            $.log(flow.session.aaa)
            var view_url = $.path.join("app","views", flow.req.url );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});
