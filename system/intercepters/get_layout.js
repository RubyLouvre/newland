$.define("get_layout", function(){
    return function( flow ){
        flow.bind("get_layout", function( layout_url, url ){
            //  $.log("进入get_layout回调")
            var fn = $.viewsCache[ layout_url ]
            if( fn ){
                var html = fn( this.helper[0], this.helper[1] );
                this.fire('cache_page', html, url);
            }else{
                $.readFile( layout_url,  'utf-8', function(err, text){
                    if(err){
                        this.fire( "send_error", 404 )
                    }else{
                        var fn = $.ejs( text );
                        if(url){//如果指定了第二个参数才存入缓存系统
                            $.viewsCache[ layout_url ] = fn
                            this.fire("get_layout", layout_url, url)
                        }else{
                            var html = fn( this.helper[0] );
                            this.fire('cache_page', html, url)
                        }

                    }
                }.bind(this))
            }
        })
    }
});


//http://www.w3.org/html/ig/zh/wiki/Contributions#bugs
//http://yiminghe.iteye.com/blog/618432

//doTaskList = function(dataList, doAsync, callback){
//    dataList = dataList.slice();
//    var ret = [];
//    var next = function(){
//        if(dataList.length < 1)
//            return callback(null, ret)
//        var d = dataList.shift();
//        try{
//            doAsync(d, function(err,data){
//                if(err)
//                    return callback(err);
//                ret.push(data);
//                next();
//            })
//        }catch(err){
//            return callback(err)
//        }
//    }
//    next();
//}