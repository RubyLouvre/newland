//基础设施之一, 高级迭代器

mass.define("eee",(Array.isArray && Object.create ? "" : "ecma"),function(){
//    var ret = {
//        //对多个对象并行执行某种相同的操作，并在它们都成功执行后调用最后的回调
//        each : function (arr, handle, last, bind) {
//            if (!arr.length) {
//                return last();
//            }
//            var completed = 0;
//            arr.forEach(function(el){
//                handle(el,function(e){
//                    completed += 1;
//                    if(e instanceof Error || completed === arr.length ){
//                        last.apply(bind, arguments);
//                        last = mass.noop;
//                    }
//                })
//            })
//        },
//        //让多个对象依次执行某种相同的操作，并在它们都成功执行后调用最后的回调
//        eachSync : function (arr, handle, last, bind) {
//            if (!arr.length) {
//                return last();
//            }
//            var completed = 0;
//            var recurse = function () {
//                handle(arr[completed], function (e) {
//                    completed += 1;
//                    if(e instanceof Error || completed === arr.length ){
//                        last.apply(bind, arguments);
//                        last = mass.noop;
//                    }else{
//                        recurse();
//                    }
//                });
//            };
//            recurse();
//        }
//    }
//    //并行化
//    var doParallel = function (fn) {
//        return function () {
//            [].unshift.call(arguments,ret.each );
//            return fn.apply(null,arguments);
//        };
//    };
//    //串行化
//    var doSeries = function (fn) {
//        return function () {
//            [].unshift.call(arguments,ret.eachSync );
//            return fn.apply(null,arguments);
//        };
//    };
//
//    var _map = function (eachfn, arr, iterator, last) {
//        var results = [];
//        arr = arr.map(function(x,i){//对原数组的元素进行包装，记得其序号
//            return {
//                index: i,
//                value: x
//            };
//        });
//        eachfn(arr, function (x) {
//            iterator(x.value, function (err, v) {
//                results[x.index] = v;
//                last(err);
//            });
//        }, function (err) {
//            last(err, results);
//        });
//    };
//    ret.map = doParallel(_map);
//    ret.mapSync = doSeries(_map);
//    return ret

//    //这里会发生四个过滤方法
//    "reject,filter".replace(mass.rword,function(method){
//        var temp = function (eachfn, arr, iterator, callback) {
//            var results = [];
//            arr = arr.map(function(x,i){//对原数组的元素进行包装，记得其序号
//                return {
//                    index: i,
//                    value: x
//                };
//            });
//            var bool =  method === "filter" ;
//            eachfn(arr, function (x, callback) {
//                iterator(x.value, function (v) {
//                    if (!!v === bool) {
//                        results.push(x);
//                    }
//                    callback();
//                });
//            }, function (err) {
//                callback(err, results.sort(function (a, b) {
//                    return a.index - b.index;
//                }).map(function (x) {
//                    return x.value;
//                }));
//            });
//        };
//        async[method] = doParallel(temp);
//        async[method+"Sync"] = doSeries(temp);
//    });
//    //注意，some, every, reduce都没有并行化版本
//    "some,every".replace(mass.rword,function(method){
//        async[method] = function (arr, iterator, main_callback) {
//            var bool =  method === "some" ;
//            async.each(arr, function (x, callback) {
//                iterator(x, function (v) {
//                    if (!!v === bool ) {
//                        main_callback(bool);
//                        main_callback = function () {};
//                    }
//                    callback();
//                });
//            }, function (err) {
//                main_callback(!bool);
//            });
//        };
//    });
//    async.reduce = function (arr, memo, iterator, callback) {
//        async.eachSync(arr, function (x, callback) {
//            iterator(memo, x, function (err, v) {
//                memo = v;
//                callback(err);
//            });
//        }, function (err) {
//            callback(err, memo);
//        });
//    };
//
//    async.reduceRight = function (arr, memo, iterator, callback) {
//        var reversed = mass.slice(arr).reverse();//不影响原数组
//        async.reduce(reversed, memo, iterator, callback);
//    };
//    async.sortBy = function (arr, iterator, callback) {
//        async.map(arr, function (x, callback) {
//            iterator(x, function (err, criteria) {
//                if (err) {
//                    callback(err);
//                } else {
//                    callback(null, {
//                        value: x,
//                        criteria: criteria
//                    });
//                }
//            });
//        }, function (err, results) {
//            if (err) {
//                return callback(err);
//            } else {
//                var fn = function (left, right) {
//                    var a = left.criteria, b = right.criteria;
//                    return a < b ? -1 : a > b ? 1 : 0;
//                };
//                callback(null, results.sort(fn).map(function (x) {
//                    return x.value;
//                }));
//            }
//        });
//    };
//    async.iterator = function (tasks) {
//        var makeCallback = function (index) {
//            var fn = function () {
//                if (tasks.length) {
//                    tasks[index].apply(null, arguments);
//                }
//                return fn.next();
//            };
//            fn.next = function () {
//                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
//            };
//            return fn;
//        };
//        return makeCallback(0);
//    };
});
