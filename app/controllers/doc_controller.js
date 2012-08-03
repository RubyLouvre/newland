$.define("doc_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(flow){
            $.log("已进入doc#index action");
            var view_url = $.path.join("app","views", flow.req.url );
            console.log(flow.req.url)
            console.log(view_url)
            flow.fire("get_view", view_url, flow.req.url )
        }

    });
    $.controllers[ "doc"] = new klass
});

