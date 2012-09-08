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
        "7z": "application/x-7z-compressed",
        asf: "video/x-ms-asf",
        au: "audio/basic",
        chm: "application/mshelp",
        css: "text/css",
        crx: "application/x-chrome-extension",

        doc: "application/msword",
        ejs: plain,
        exe: "application/octet-stream",
        flw: "flv-application/octet-stream",
        gif: "image/gif",
        html: "text/html",
      
        hlp: "application/mshelp",
        htc: "text/x-component",
        ico: "image/x-icon",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        json: "text/json,application/json",
        js:   "text/javascript,application/javascript",
        jar:  "application/java-archive",
        "class": "application/java-vm",
        log:  plain,
        m3u8: "application/vnd.apple.mpegurl",
        mpg: "video/mpeg",
      
        mid: "audio/x-midi",
        midi: "audio/x-midi",
        mp2: "audio/x-mpeg",
        mp3: "audio/mpeg",
        m4p: "application/mp4",
        m4a: "audio/mp4",
        php: "application/x-httpd-php",
        phtml: "application/x-httpd-php",
        ppt: "application/mspowerpoint",
        manifest: "text/cache-manifest",

        otf: "font/opentype",//字体
        pdf: "application/pdf",
        png: "image/png",

        rsd: "application/rsd+xml",
        rss: "application/rss+xml",
        ra: "audio/x-pn-realaudio",
        ram: "audio/x-pn-realaudio",
        rm: "video/x-pn-realvideo",
        rmvb: "application/vnd.rn-realmedia",
        svg: "image/svg+xml",
        swf: "application/x-shockwave-flash",

        tiff: "image/tiff",
        txt: plain,
        text: plain,

        ts:  "video/MP2T",
        wav: "audio/x-wav",
        wma: "audio/x-ms-wma",
        wmv: "video/x-ms-wmv",
        woff: 'font/opentype',
        wml: "video/x-ms-asf",
        xml:  "text/xml,application/xml",
        xls: "application/vnd.ms-excel",
        xla: "application/msexcel",
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
    //=================================================
    function ext2mime(ext, fallback){
        var ret =  mapper[ext.toLowerCase()] || fallback || "";
        return ret.replace(/,.*/,"")
    }
    function path2ext ( path ){
        return path.replace(/.*[\.\/]/, '').toLowerCase();
    }
    function accept2ext(accept, fallback){
        for (var key in formats) {
            if ( formats[key].test(accept) ) {
                return key
            }
        }
        return fallback;
    }
    return {
        //通过路径找到目标资源对应的mime
        path2mime: function(path, fallback){
            return ext2mime( path2ext(path), fallback)
        },
        //通过ext找到对应的mime
        ext2mime: ext2mime,
        //通过路径找到目标资源对应的扩展名
        path2ext: path2ext,
        //通过accept找到对应的扩展名
        accept2ext: accept2ext,
        accept2mime:  function(accept, fallback){
            return  accept2ext(accept, fallback)
        },
        //如果框架没有支持这个MIME,可以自己注册一个
        registerMime: function(ext, mime){
            if( mapper[ext] == void 0){
                mapper[ext] = mime;
                toRegExp({
                    ext:mime
                })
            }
        }
    };

})
