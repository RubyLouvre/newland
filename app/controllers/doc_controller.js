$.define("doc_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(flow){
            // $.log("已进入doc#index action");
        
            var view_url = $.path.join("app","views", flow.req.url );
            if(/doc\/index\.html/.test(flow.req.url)){
                flow.res.setHeader("Set-Cookie","aaa=bbb")
                flow.res.setHeader("Set-Cookie","eee=ddd")
            }
              
            flow.fire("get_view", view_url, flow.req.url )
        }

    });
    $.controllers[ "doc"] = new klass
});

