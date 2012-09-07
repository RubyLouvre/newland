/*处理MIME，Multipurpose Internet Mail Extensions的模块, 一般我们可以Content-Type首部取得它.
Content-Type: [type]/[subtype]; parameter
type有下面的形式。
Text：用于标准化地表示的文本信息，文本消息可以是多种字符集和或者多种格式的；
Multipart：用于连接消息体的多个部分构成一个消息，这些部分可以是不同类型的数据；
Application：用于传输应用程序数据或者二进制数据；
Message：用于包装一个E-mail消息；
Image：用于传输静态图片数据；
Audio：用于传输音频或者音声数据；
Video：用于传输动态影像数据，可以是与音频编辑在一起的视频数据格式。
subtype用于指定type的详细形式。content-type/subtype配对的集合和与此相关的参数，将随着时间而增长。
为了确保这些值在一个有序而且公开的状态下开发，MIME使用Internet Assigned Numbers Authority (IANA)作为中心的注册机制来管理这些值。
常用的subtype值如下所示：
text/plain（纯文本）
text/html（HTML文档）
application/xhtml+xml（XHTML文档）
image/gif（GIF图像）
image/jpeg（JPEG图像）【PHP中为：image/pjpeg】
image/png（PNG图像）【PHP中为：image/x-png】
video/mpeg（MPEG动画）
application/octet-stream（任意的二进制数据）
application/pdf（PDF文档）
application/msword（Microsoft Word文件）
message/rfc822（RFC 822形式）
multipart/alternative（HTML邮件的HTML形式和纯文本形式，相同内容使用不同形式表示）
application/x-www-form-urlencoded（使用HTTP的POST方法提交的表单）
multipart/form-data（同上，但主要用于表单提交时伴随文件上传的场合）
 */

define("mime", function(){
    var plain = "text/plain";
    var mapper = {
        ejs: plain,
        css: "text/css",
        gif: "image/gif",
        html: "text/html",
        ico: "image/x-icon",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        json: "text/json,application/json",
        js:   "text/javascript,application/javascript",
        log:  plain,
        manifest: "text/cache-manifest",
        pdf: "application/pdf",
        png: "image/png",
        svg: "image/svg+xml",
        swf: "application/x-shockwave-flash",
        tiff: "image/tiff",
        txt: plain,
        text: plain,
        wav: "audio/x-wav",
        wma: "audio/x-ms-wma",
        wmv: "video/x-ms-wmv",
        woff: 'font/opentype',
        xml:  "text/xml,application/xml",
        default_type: "application/octet-stream"
    }
    var formats = {}
    function toRegExp( obj ){
        for(var key in obj){
            if( formats[key] == void 0){
                var value = obj[key];
                formats[key] = new RegExp( value.replace(/\,/g,"|").replace(/(\/)/g, "\\$1") )
            }
        }
    }
    toRegExp(mapper);
    var ret = {
        //取得pathname中的文件扩展名,进而取得MIME
        path2mime: function(path, fallback){
            var ext = path.replace(/.*[\.\/]/, '').toLowerCase();
            return mapper[ext] || fallback || mapper.default_type
        },
        ext2mime: function(ext, fallback){
            return mapper[ext] || fallback;
        },
        //取得pathname中文的件扩展名
        path2ext: function( path ){
            return path.replace(/.*[\.\/]/, '').toLowerCase();
        },
        //通过accept找到对应的扩展名
        accept2ext: function(accept, fallback){
            for (var key in formats) {
                if ( formats[key].test(accept) ) {
                    return key
                }
            }
            return fallback;
        },
        registerMime: function(ext, mime){
            if( mapper[ext] == void 0){
                mapper[ext] = mime;
                toRegExp({
                    ext:mime
                })
            }
        }
    }
    ret.accept2mime = function(accept, fallback){
      return  ret.accept2ext(accept, fallback)
    }
    return ret;

})
