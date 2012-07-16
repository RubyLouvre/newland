$.define("mime",function(){
    $.log("本模块用于取得MIME,并作为request.mime而存在");
    return $.intercepter(function(req, res){
        $.log("进入MIME回调");
        var str = req.headers['content-type'] || '';
        req.mime = str.split(';')[0];
        return true;
    });
});
