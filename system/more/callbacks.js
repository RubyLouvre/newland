$.define("lang","more/callbacks, more/spec",function(  ){
    $.log("已加载text/callbacks模块", "> 6");
    $.fixture("callbacks", function(){
        //===================================回调列队相关==========================================
        var indexOf = function ( fn ) {//fix 古老浏览器Array没有indexOf方法
            for (var i = 0,n = this.length ; i < n ; i++) {
                if (this[i] === fn) {
                    return i;
                }
            }
            return -1;
        };
        //  once: 保证回调函数列表只能被 .fire() 一次。(就像延迟对象一样)
        //  memory: 持续保留前一个值，当fire之后,将保存其context与args，以后再添加一个新回调时，
        //  立即用这两个东西去调用它，它们只会被下一次的fireWith的参数所改变
        //  unique: 保证一个回调函数只能被添加一次(也就是说，在回调函数列表中，没有重复的回调函数)。
        //  stopOnFalse: 当回调函数返回 false 时，中断调用。
        $.Callbacks  = function(str){//一个简单的异步列队
            var opts = typeof str == "string" ? $.oneObject(str) : {},list = [];
            if(!list.indexOf){
                list.indexOf = indexOf;
            }
            var context, args, fired
            list.has = function( fn ){
                return list.indexOf( fn ) !== -1
            }
            list.add = function(fn){
                if(!list.locked){//允许在异步fire中添加
                    if( typeof fn == "function"  && ( !opts.unique || !list.has( fn ) )  ){
                        list.push( fn )
                    }
                }
                if( opts.memory && fired){ //这时只影响当前添加的函数
                    fn.apply( context, args )
                }
                return list;
            }
            list.remove = function( fn ){
                var i = isFinite( fn ) ? fn :  this.indexOf(fn);
                if( i > -1 ){
                    list.splice(i,1)
                    var j = this.indexOf(fn);
                    if( j > -1 ){
                        return this.remove( j )
                    }
                }
                return list;
            }
            list.lock = function(){//锁住
                list.locked = true;
            }
            list.fire = function(){
                return  list.fireWith(list, Array.apply([],arguments))
            }
            list.disable = function(){//禁止操作
                list.add = list.remove = list.fireWith = $.noop
            }
            list.fireWith = function( c, a ){
                if(list.locked !== true  && (!opts.once || !fired ) ){
                    context = c, args = $.type( a, "Array") ? a : [];
                    var arr = opts.once ? list: list.concat(), fn
                    while( ( fn = arr.shift() ) ){
                        var ret = fn.apply( context, args);
                        if( opts.stopOnFalse && ret === false){
                            break;
                        }
                    }
                    fired = true;
                }
                return list
            }
            return list
        }
    })
});