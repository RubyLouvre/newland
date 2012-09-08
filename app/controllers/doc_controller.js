define( function(){
    return {
        index: function(flow){
            $.log("已进入doc#index action");
            var params = flow.params;
            if(params.first == "index.html"){
                flow.render("html",{
                    location: flow._cname + "/"+ flow._aname
                })
            }else if(params.second){
                flow.render("html",{
                    location: flow._cname + "/"+ params.first +"/" + params.second.replace(".html","")
                })
            }
        }
    }
});
