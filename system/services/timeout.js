define( function(){
    return function( flow ){
        var ms = $.config.timeout || 5000;
        var id = setTimeout(function(){
            flow.fire("send_error", 408, "Request timeout");
        }, ms);
        flow.bind('header', function(){
            clearTimeout(id);
        });
    }
})

//计算字节因该用这个代码

//// 字节长度
//// utf-16 是 javascript 本地字符集
//string.sizeof = function (str, charset)
//{
//		charset = (charset || 'UTF8').toUpperCase();
//
//		var i = 0, j = str.length, n = 0, c;
//
//		if ('UTF16' === charset)
//		{
//				for (; i < j; i++)
//				{
//						c = str.charCodeAt(i);
//
//						if (c < 65536)
//						{
//								n += 2;
//						}
//						else
//						{
//								n += 4;
//						}
//				}
//		}
//		else if ('UTF8' === charset)
//		{
//				for (; i < j; i++)
//				{
//						c = str.charCodeAt(i);
//
//						if (c < 128)
//						{
//								n++;
//						}
//						else if (c < 2048)
//						{
//								n += 2;
//						}
//						else if (c < 65536)
//						{
//								n += 3;
//						}
//						else
//						{
//								n += 4;
//						}
//				}
//		}
//
//		return n;
//};