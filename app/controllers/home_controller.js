$.define("home_controller",function(){
    var klass = $.factory({
        inherit: $.base_controller,
        index: function(){
            $.log("home#index action")
        }
    });
    $.controllers[ "home"] = new klass
});

