$.define("home_controller",function(){
    $.log("已加载 ../../system/controller 模块")
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(){
            $.log("home#index action")
        }
    });
    console.log( $.controllers)
    $.controllers[ "home"] = new klass
});

