
$.define("session", function () {

    $.log("已加载session模块");

    function session (res, cookies){
        this._response = res;
        this._cookies = cookies;
        this._sid = cookies.get(this._cookieName);
    }

    session.prototype._cookieName = 'JSSESSID';

    session.prototype._maxlifetime = 1440;

    session.prototype._method = require('./session/memory.js');

    session.prototype.start = function (callback)
    {
        if (!this._sid)
        {
            this._sid = uuid(32);
        }

        this._life = this._maxlifetime;

        var handler = this._handler = new this._method;
        this.sessionID = this._sid;

        // 设置属性
        this.setAttribute = handler.write.bind(handler);

        // 获得属性
        this.getAttribute = handler.read.bind(handler);

        // 移除属性
        this.removeAttribute = handler.remove.bind(handler);

        // 当调用 response.end 方法时，会触发 finish 事件
        this._response.once('finish', handler.commit.bind(handler));

        // 会话打开后，回调函数内部可正常使用会话
        handler.open(callback, this._sid, this._life);
    };

    // 销毁会话
    session.prototype.destroy = function ()
    {
        this._cookies.set(this._cookieName, '', -1, '/');
        this._handler && this._handler.destroy();
    };

    // 设置ID 或 返回ID
    session.prototype.__defineSetter__('sessionID', function (v)
    {
        this._cookies.set(this._cookieName, v, this._life, '/');
        this._sid = v;
    });
    session.prototype.__defineGetter__('sessionID', function ()
    {
        return this._sid;
    });

    // 设置超时时间 或 返回超时时间
    session.prototype.__defineSetter__('timeout', function (v)
    {
        this._life = v;
        this._handler && (this._handler._life = v);
        this.sessionID = this._sid;
    });
    session.prototype.__defineGetter__('timeout', function ()
    {
        return this._life;
    });

    function uuid (len)
    {
        var id = '', i = 0, j = (len || 16) | 0;
        for (; i < j; i++) id += Math.floor(Math.random()*16.0).toString(16);
        return id;
    };


    return session;

});
/*
会话使用方式
session.start(function (){

session.setAttribute(key, val);

session.getAttribute(key);

session.removeAttribute(key)
*/