define(  ["util"] ,function(util){
    return function(flow){
        //劫持res.end方法
        flow.bind("open_session", function(){
            flow.flash = function (type, msg) {
                if (this.session === undefined)
                    throw Error('flow.flash() requires sessions');
                var msgs = this.session.flash = this.session.flash || {};
                if (type && msg) {
                    // util.format is available in Node.js 0.6+
                    // http://nodejs.org/api/util.html#util_util_format_format
                    if (arguments.length > 2 && util.format) {
                        var args = $.slice(arguments, 1);
                        msg = util.format.apply(util, args);
                    }
                    return (msgs[type] = msgs[type] || []).push(msg);
                } else if (type) {
                    var arr = msgs[type];
                    delete msgs[type];
                    return arr || [];
                } else {
                    this.session.flash = {};
                    return msgs;
                }
            }
        })
    }
})
//202.8.19 此服务受限于session服务
/*
//两个或两个以上是添加消息
flow.flash('info', 'email sent');
flow.flash('error', 'email delivery failed');
flow.flash('info', 'email re-sent');
// => 2
//一个是返回这个类型的所有消息,并从session中删除它们
flow.flash('info');
// => ['email sent', 'email re-sent']

flow.flash('info');
// => []
//没有参数就返回一个对象,里面分门别类放置好各消息
flow.flash();
// => { error: ['email delivery failed'], info: [] }
*/

//http://www.csser.com/board/4f77e6f996ca600f78000936#/post/4f77e94896ca600f780009f8
//http://www.hacksparrow.com/express-js-logging-access-and-errors.html
