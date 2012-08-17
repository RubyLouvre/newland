$.define("memory","../mass/more/random,mongo",function(random){
    $.log("使用内存来保存session")
    var store = $.memory || ($.memory = {})
    function sweep (){//清理过期的session
        var now = +new Date;
        for (var key in store) {
            if (store[key].timestamp < now){
                delete store[key];
            }
        }
    }
    // 每 24 分钟执行一次
    setInterval(sweep, 1440 * 1000);

    function memory (sid, life) {
        this.sid = sid || random.uuid()
        this.life = life;
        this.data = {}
        this.timestamp =  new Date * 1 + life
    };
    //为一个用户分配一个新的session
    memory.prototype = {
        get: function (key){
            return this.data[key];
        },
        set: function (key, val){
            this.data[key] = val;
            //每次都延长一段时间
            this.timestamp = new Date * 1 + this._life;
        },
        remove: function (key){
            delete this._data[key];
            this.timestamp = new Date * 1 + this._life;
        },
        clear: function (){
            this.data = {};
            delete store[this.sid];
        }
    }
    return  function(sid, life){
        var obj = store[sid];
        if(!obj){
            obj = new memory (sid, life)
            return  store[obj.sid] = obj;
        }else{
            return obj
        }
    }

})
