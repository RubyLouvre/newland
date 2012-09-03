define( ["../more/less/index"], function(less){
    function toCSS(path, callback) {
        var tree, css;
        $.readFile(path, 'utf-8', function (e, str) {
            if (e) {
                return callback(e)
            }
            new(less.Parser)({
                paths: [require('path').dirname(path)],
                optimization: 0
            }).parse(str, function (err, tree) {
                if (err) {
                    callback(err);
                } else {
                    try {
                        css = tree.toCSS();
                        callback(null, css);
                    } catch (e) {
                        callback(e);
                    }
                }
            });
        });
    }
    return function( flow ){
        flow.bind("get_less", function( path ){
            $.log("已进入get_less栏截器", 7);
            toCSS(path, function (err, less) {
                $.writeFile(path.replace(/\.less$/,".css"), less, function(e){
                    if(e){
                        return  this.fire("send_error", 404)
                    }else{
                        this.fire("no_action")
                    }
                }.bind(flow))
            });
        })
    }
})


