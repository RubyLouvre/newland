$.define("doc_controller",function(){
    return {
        index: function(flow){
            $.log("已进入doc#index action");
            flow.session.get("home",function(el){
                console.log(el)
            })
            var view_url = $.path.join("app","views", flow.req.url );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});
