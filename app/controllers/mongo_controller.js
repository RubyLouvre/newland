$.define("mongo_controller",function(){
    return {
        index: function(flow){
            $.log("这里是用于放置芒果的文档")
            var view_url = $.path.join("app","views", "mongo","index.html" );
            flow.fire("get_view", view_url, flow.req.url )
        }
    }
});

