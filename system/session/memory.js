/**
 *
 * @author          liuzhaohui
 * @contact         Email: hi.liuzhaoxin@gmail.com, QQ: 50081449, QQqun: 141227364
 *
 * -----------------------------
 * Happy Coding
 *
**/

module.exports = memory;

var store = {};

// 每 24 分钟执行一次
setInterval(sweep, 1440 * 1000);

function sweep ()
{
		var now = +new Date, s = store, k;
		for (k in s) if (s[k].timestamp < now) delete s[k];
}

function memory () {}

memory.prototype.open = function (callback, sid, life)
{
		this._sid = sid;
		this._life = life;
		this._store = store[sid] = store[sid] || {data: {}};
		this._store.timestamp = new Date + life;
		callback();
};

memory.prototype.read = function (key, def)
{
		return this._store.data[key] === undefined ? def : this._store.data[key];
};

memory.prototype.write = function (key, val)
{
		this._store.data[key] = val;
		this._store.timestamp = +new Date + this._life;
};

memory.prototype.remove = function (key)
{
		delete this._store.data[key];
		this._store.timestamp = +new Date + this._life;
};

memory.prototype.destroy = function ()
{
		delete this._store;
		delete store[this._sid];
};

memory.prototype.commit = function () {};
