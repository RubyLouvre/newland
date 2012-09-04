define( function(){
    return {
        index: function(flow){
            $.log("已进入doc#index action");
            flow.render({
                ext: ".html"
            })
        }
    }
});
