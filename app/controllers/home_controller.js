$.define("home_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(flow){
            $.log("已进入home#index action")
            flow.fire("send_file",{
                code: 200,
                data:"<h1>XXXXXXXXXXXXXXXX</h1>",
                mine:"text/html"
            })
        }
    });
    $.controllers[ "home"] = new klass
});

