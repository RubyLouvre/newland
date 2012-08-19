$.define("newland_controller",function(){
    return {
        index: function(flow){
            var view_url = $.path.join("app","views", flow.req.url,"index.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});
