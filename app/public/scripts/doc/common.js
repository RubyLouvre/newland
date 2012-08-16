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
    $.require("ready,event",function(){
        $("pre").each(function(){
            if(this.exec !== "function"){
                var self = $(this), btn = self.next("button.doc_btn")
                if(/brush:\s*j/i.test(this.className)  && btn.length ){
                    var code =  $.String.unescapeHTML( this.innerHTML );
                    var fn = Function( code );
                    btn[0].exec = fn;
                }
            }
        });
        window.SyntaxHighlighter && SyntaxHighlighter.highlight();
        $("body").delegate(".doc_btn","click",function(){
            if(typeof this.exec == "function"){
                this.exec.call(window)
            }
        });
    });
})();
