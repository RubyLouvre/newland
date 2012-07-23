$.define("status",function(){
    //返回一个包含主要状态码的对象
    return {
        100:{
            en: "Continue",
            zh: "客户端应当继续发送请求"
        },
        101:{
            en: "Switching Protocols",
            zh: "服务器已经理解了客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议来完成这个请求"
        },
        102:{
            en: "Processing",
            zh: "处理将被继续执行"
        },
        200: {
            en: "OK",
            zh:"请求已成功，请求所希望的响应头或数据体将随此响应返回"
        },
        201:{
            en:"Created",
            zh:"请求已经被实现，而且有一个新的资源已经依据请求的需要而建立，且其URI已经随Location头信息返回"
        },
        202:{
            en: "Accepted",
            zh: "服务器已接受请求，但尚未处理"
        } ,
        203:{
            en:"Non-Authoritative Information",
            zh:"服务器已成功处理了请求，但返回的实体头部元信息不是在原始服务器上有效的确定集合，而是来自本地或者第三方的拷贝"
        },
        204:{
            en: "No Content",
            zh:"服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息"
        },
        205:{
            en:"Reset Content",
            zh:"服务器成功处理了请求，且没有返回任何内容。但是与204响应不同，返回此状态码的响应要求请求者重置文档视图"
        },
        206:{
            en: "Partial Content",
            zh:" 服务器已经成功处理了部分GET请求"
        },
        207:{
            en: "Multi-Status",
            zh:"消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码"
        },
        300:{
            en: "Multiple Choices",
            zh: "被请求的资源有一系列可供选择的回馈信息，每个都有自己特定的地址和浏览器驱动的商议信息"
        },
        301:{
            en: "Moved Permanently",
            zh: "被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个URI之一"
        },
        302:{
            en: "Found",
            zh:"请求的资源现在临时从不同的URI响应请求"
        },
        303:{
            en: "See Other",
            zh: "对应当前请求的响应可以在另一个URI上被找到，而且客户端应当采用GET的方式访问那个资源"
        },
        304: {
            en: "Not Modified",
            zh: "如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码"
        },
        305:{
            en: "Use Proxy",
            zh: "被请求的资源必须通过指定的代理才能被访问"
        },
        306: {
            en: "Switch Proxy",
            zh:"在最新版的规范中，306状态码已经不再被使用"
        },
        307:{
            en: "Temporary Redirect",
            zh:"请求的资源现在临时从不同的URI响应请求"
        },
        400:{
            en: "Bad Request",
            zh: "由于包含语法错误，当前请求无法被服务器理解"
        },
        401:{
            en: "Unauthorized",
            zh:"当前请求需要用户验证"
        },
        402: {
            en: "Payment Required",
            zh:"该状态码是为了将来可能的需求而预留的",
        },
        403:{
            en: "Forbidden",
            zh: "服务器已经理解请求，但是拒绝执行它"
        },
        404:{
            en: "Not Found",
            zh: "请求失败，请求所希望得到的资源未被在服务器上发现"
        },
        405:{
            en: "Method Not Allowed",
            zh: "请求行中指定的请求方法不能被用于请求相应的资源"
        },
        406:{
            en: "Not Acceptable",
            zh: "请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体"
        },
        407: {
            en: "Proxy Authentication Required",
            zh:"与401响应类似，只不过客户端必须在代理服务器上进行身份验证"
        },
        408:{
            en: "Request Timeout",
            zh: "请求超时"
        },
        409:{
            en: "Conflict",
            zh: "由于和被请求的资源的当前状态之间存在冲突，请求无法完成"
        },
        410:{
            en: "Gone",
            zh: "被请求的资源在服务器上已经不再可用，而且没有任何已知的转发地址"
        },
        411:{
            en: "Length Required",
            zh: "服务器拒绝在没有定义Content-Length头的情况下接受请求"
        },
        412: {
            en: "Precondition Failed",
            zh:"服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个"
        },
        413:{
            en: "Request Entity Too Large",
            zh:"服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围"
        },
        414: {
            en:"Request-URI Too Long",
            zh:"请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务"
        },
        415: {
            en:  "Unsupported Media Type",
            zh: "对于当前请求的方法和所请求的资源，请求中提交的实体并不是服务器中所支持的格式，因此请求被拒绝"
        },
        416: {
            en:"Requested Range Not Satisfiable",
            zh: " 如果请求中包含了Range请求头，并且Range中指定的任何数据范围都与当前资源的可用范围不重合，同时请求中又没有定义If-Range请求头"
        },
        417: {
            en: "Expectation Failed",
            zh:"在请求头Expect中指定的预期内容无法被服务器满足，或者这个服务器是一个代理服务器，它有明显的证据证明在当前路由的下一个节点上，Expect的内容无法被满足"
        },

        421:{
            en: "There are too many connections from your internet address",
            zh:"从当前客户端所在的IP地址到服务器的连接数超过了服务器许可的最大范围"
        },
        422:{
            en: "Unprocessable Entity",
            zh:"请求格式正确，但是由于含有语义错误，无法响应"
        },
        423:{
            en: "Locked",
            zh:" 当前资源被锁定"
        },
        424:{
            en: "Failed Dependency",
            zh:"由于之前的某个请求发生的错误，导致当前请求失败，例如PROPPATCH"
        },
        425:{
            en: "Unordered Collection",
            zh:"在WebDav Advanced Collections草案中定义"
        },
        426:{
            en: "Upgrade Required",
            zh:" 客户端应当切换到TLS/1.0"
        },
        449:{
            en: "Retry With",
            zh:"由微软扩展，代表请求应当在执行完适当的操作后进行重试"
        },
        500:{
            en: "Internal Server Error",
            zh: "服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理"
        },
        501:{
            en: "Not Implemented",
            zh: "服务器不支持当前请求所需要的某个功能"
        },
        502:{
            en: "Bad Gateway",
            zh: "作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应"
        },
        503:{
            en: "Service Unavailable",
            zh: "由于临时的服务器维护或者过载，服务器当前无法处理请求"
        },
        504:{
            en: "Gateway Timeout",
            zh: "作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应"
        },
        505:{
            en: "HTTP Version Not Supported",
            zh: "服务器不支持，或者拒绝支持在请求中使用的HTTP版本"
        },
        506:{
            en: "Gateway Timeout",
            zh: "由《透明内容协商协议》（RFC 2295）扩展，代表服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点"
        },
        507:{
            en: "Insufficient Storage",
            zh: "服务器无法存储完成请求所必须的内容。这个状况被认为是临时的。WebDAV（RFC 4918）"
        },
        509:{
            en: "Bandwidth Limit Exceeded",
            zh: "服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用"
        },
        510:{
            en: "Not Extended",
            zh: "获取资源所需要的策略并没有没满足"
        }
    }

})

/*
http://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81
HTTP状态码分类
分类	含义
1XX	表示消息。这一类型的状态码，代表请求已被接受，需要继续处理。这类响应是临时
        响应，只包含状态行和某些可选的响应头信息，并以空行结束。
2XX	表示成功。这一类型的状态码，代表请求已成功被服务器接收、理解、并接受。
3XX	表示重定向。这类状态码代表需要客户端采取进一步的操作才能完成请求。通常，
        这些状态码用来重定向后续的请求地址（重定向目标）在本次响应的Location域中指明。
4XX	表示请求错误。这类的状态码代表了客户端看起来可能发生了错误，妨碍了服务器的处理。
        除非响应的是一个HEAD请求，否则服务器就应该返回一个解释当前错误状况的实体，
        以及这是临时的还是永久性的状况。这些状态码适用于任何请求方法。浏览器应当向
        用户显示任何包含在此类错误响应中的实体内容。
5XX	表示服务器错误。这类状态码代表了服务器在处理请求的过程中有错误或者异常状态
        发生，也有可能是服务器意识到以当前的软硬件资源无法完成对请求的处理。
        除非这是一个HEAD请求，否则服务器应当包含一个解释当前错误状态以及这个状况
        是临时的还是永久的解释信息实体。浏览器应当向用户展示任何在当前响应中被包含的实体。
*/