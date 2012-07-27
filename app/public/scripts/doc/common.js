(function(){
    ("abbr article aside audio canvas datalist details figcaption figure footer " +
        "header hgroup mark meter nav output progress section summary time video"
        ).replace($.rword,function(tag){
        document.createElement(tag)
    });
 
    if(self.eval !== top.eval){
        window.$ && $.require("ready,node,css",function(){
            var iheight = parseFloat( document.outerHeight || $("article").outerHeight() ); //取得其高
            if(iheight < 400)
                iheight = 500;
            $.log(iheight)
            $("#iframe",parent.document).height(iheight);
        });
    }
})();