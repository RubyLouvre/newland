define( function(){
    return {
        index: function(flow){
            $.log("已进入mvvm#index action");
            var params = flow.params;
            console.log(params)
            if(params.first ){
                flow.render("html",{
                    location: flow._cname + "/"+ params.first
                })
            }
        }
    }
});