(function(){
    ("abbr article aside audio canvas datalist details figcaption figure footer " +
        "header hgroup mark meter nav output progress section summary time video"
        ).replace($.rword,function(tag){
        document.createElement(tag)
    });
 
    if(self.eval !== top.eval){
        window.$ && $.require("ready,css,node",function(){
            parent.callParent && parent.callParent(document);
        });
    }
    window.SyntaxHighlighter && SyntaxHighlighter.all();
    $.require("ready,event",function(){
        $("body").delegate(".doc_btn","click",function(){
            if(typeof this.exec == "function"){
                this.exec.call(window)
            }
        });
    });
})();