(function(){
    ("abbr article aside audio canvas datalist details figcaption figure footer " +
        "header hgroup mark meter nav output progress section summary time video"
        ).replace($.rword,function(tag){
        document.createElement(tag)
    });
 
    if(self.eval !== top.eval){
        window.$ && $.require("ready,css,node",function(){
            parent.callParent && parent.callParent(document)
        });
    }
    window.SyntaxHighlighter && SyntaxHighlighter.all();
    $.require("ready,event",function(){
        $("body").delegate(".doc_btn","click",function(){
            if(this.exec){
                this.exec.call(window)
            }else{
                var btn =  $(this);
                console.log(btn.prev("pre").text())
                var fn = Function( $.String.unescapeHTML(btn.prev("pre").text()) );
                fn();
                this.exec = fn;
            }
        });
        
    });

})();