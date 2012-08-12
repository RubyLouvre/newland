$.define("doc_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(flow){
            $.log("已进入doc#index action");
            flow.session.set("xxx","in doc")
            var view_url = $.path.join("app","views", flow.req.url );

            flow.fire("get_view", view_url, flow.req.url )
        }

    });
    $.controllers[ "doc"] = new klass
});

