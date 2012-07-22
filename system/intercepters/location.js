$.define("location","querystring,url,path",function(qs,url,path){
     //本模块用于为req添加两个对象属性, location与query"
    return $.intercepter(function(req, res){
        console.log("进入location回调");
        var location = url.parse(req.url);
        req.query =  qs.parse(location.query || "") ;
        location.query = req.query;
        location.extname = path.extname(req.url);
        location.toString = function(){
            return req.url;
        }
        req.location = location;
        return true;
    })
})


