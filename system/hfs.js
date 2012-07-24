//height level file system
$.define( "hfs","fs,path", function(fs, path){
    // console.log("已加载了hfs模块")
    $.mix( {
        //遍历文件树,收集目录与文件,并包含自身
        //p为路径，cb为最终回调，opts为可选的配置对象，
        //里面包含filter表示过滤函数，one表示是否找到一个就终于遍历
        //sync表示是否同步
        walk: new function  (){
            function collect(opts, el, prop){
                if((typeof opts.filter == "function") ? opts.filter( el ) : true){
                    opts[prop].push( el );
                    if(opts.one === true){
                        opts.filter = function(){
                            return false
                        };
                        opts.count = 0;
                    }
                }
            }
            function sync( p, opts){
                try{
                    var stat = fs.statSync( p );
                    var prop = stat.isDirectory() ? "dirs" : "files";
                    collect(opts, p, prop );
                    if( prop === "dirs"){
                        var array = fs.readdirSync( p );
                        for(var i = 0, n = array.length; i < n; i++ ){
                            sync( path.join( p , array[i]), opts )
                        }
                    }
                }catch(e){ }
            }
            function async( p, opts ){
                opts.count++
                fs.stat(p, function(e, s){
                    opts.count--
                    if(!e){
                        if( s.isDirectory() ){
                            collect(opts, p, "dirs");
                            opts.count++
                            fs.readdir( p, function(e, array){
                                opts.count--;
                                for(var i = 0, n = array.length; i < n; i++ ){
                                    async( path.join( p , array[i]), opts )
                                }
                                if(opts.count == 0){
                                    opts.cb(opts.files, opts.dirs)
                                }
                            });
                        }else{
                            collect(opts, p, "files");
                        }
                        if(opts.count == 0){
                            opts.cb(opts.files, opts.dirs)
                        }
                    }
                    if(e && e.code == "ENOENT"){
                        opts.cb(opts.files, opts.dirs)
                    }
                });
            }
            return function( p, cb, opts ){
                if(typeof cb == "object"){
                    opts = cb
                    cb = opts.cb;
                }
                opts = opts ||{}
                opts.files = [];
                opts.dirs = [];
                opts.cb = typeof cb === "function" ? cb : $.noop
                opts.count = 0;
                if(opts.sync){
                    sync( path.normalize(p), opts );
                    opts.cb(opts.files, opts.dirs)
                }else{
                    async( path.normalize(p), opts );
                }
            }
        },
        //删除文件或目录,如果里面有东西,也一并清空,这是同步化版本
        delSync: function(p, cb){
            $.walk(p, {
                cb: function( files, dirs ){
                    var c = 0
                    while((c = files.shift())){
                        try{
                            fs.rmdirSync(c)
                        } catch(e){}
                    }
                    while((c = dirs.pop())){
                        try{
                            fs.rmdirSync(c)
                        } catch(e){}
                    }
                },
                sync: true
            });
            if(typeof cb == "function" ){
                cb()
            }
        },
        //上面的异步化版本
        del: new function( ){
            function inner(dirs, cb){
                var dir = dirs.pop();
                if(dir){
                    fs.rmdir(dir, function(e){
                        inner(dirs, cb);
                    })
                }else{
                    cb()
                }
            }
            return function( p, cb ){
                $.walk(p, function( files, dirs ){
                    var c = files.length, n = c;
                    if( n ){
                        for(var i = 0 ; i < n ; i++){//先删除文件再从最深处起往外删除目录
                            fs.unlink(files[i], function(e){
                                c--
                                if(c == 0){
                                    inner(dirs, cb)
                                }
                            })
                        }
                    }else{//如果不存在文件
                        inner(dirs, cb)
                    }
                });
            }
        },
        //创建目录,如果指定路径中有许多中间的目录不存在,也一并创建它们
        mkdirSync: function(p){
            p = path.normalize(p);
            var array = p.split( path.sep );//创建目录,没有则补上
            for(var i = 0, cur; i < array.length; i++){
                if(i == 0){
                    cur = array[i];
                }else{
                    cur += (path.sep + array[i]);
                }
                try{
                    fs.mkdirSync(cur, "0755");
                }catch(e){}
            }
        },
        //上面的异步化版本
        mkdir: function(p, cb){
            p = path.normalize(p);
            var array = p.split( path.sep );
            function inner(dir, array, cb ){
                dir  += (!dir ? array.shift() :  path.sep + array.shift());
                fs.mkdir(dir, "0755", function(){
                    if(array.length){//忽略EEXIST错误
                        inner(dir ,array, cb);
                    }else if(typeof cb === "function"){
                        cb();
                    }
                });
            }
            inner("", array, cb)
        },
        readFile: function(){
            fs.readFile.apply(fs, arguments)
        },
        readFileSync: function(){
            fs.readFileSync.apply(fs, arguments)
        },
        //创建文件,并添加内容,如果指定的路径中里面某些目录不存在,也一并创建它们
        writeFileSync: function( p , data, encoding){
            p = path.normalize(p);
            var i = p.lastIndexOf(path.sep)
            var dir = p.slice(0, i);
            if(dir){
                $.mkdirSync(dir, "0755" )
            }
            fs.writeFileSync( p, data, encoding)
        },
        //上面的异步化版本
        writeFile: function(p, data, cb){
            p = path.normalize(p);cb = cb || $.noop
            var i = p.lastIndexOf( path.sep )
            var dir = p.slice(0, i);
            var fn  = function(){
                fs.writeFile( p, data, "utf-8", cb)
            }
            dir ? $.mkdir(dir, fn) : fn();
        },
        //目录对拷,可以跨分区拷贝
        cpdirSync: new function(old, neo, cb) {
            function inner( old, neo ) {
                var array = fs.readdirSync(old);
                for(var i  = 0 , n = array.length; i < n ; i++){
                    var source = array[i]
                    var target = path.join( neo, source.replace(old,"") )
                    var stat = fs.statSync( source );//判定旧的IO对象的属性，是目录还是文件或是快捷方式
                    if(stat.isDirectory()){
                        inner( source, target )
                    }else if(stat.isSymbolicLink()){
                        fs.symlinkSync( fs.readlinkSync( source ),target);
                    }else {
                        fs.writeFileSync( target, fs.readFileSync( source) );
                    }
                }
            }
            return function(old, neo, cb){//把当前目录里面的东西拷贝到新目录下（不存在就创建）
                old = path.resolve(process.cwd(), old);
                neo = path.resolve(process.cwd(), neo);//允许拷贝到另一个分区中
                if(!fs.existsSync(neo)){//创建新文件
                    $.mkdirSync( neo )
                }
                inner(old, neo);
                if(typeof cb == "function" ){
                    cb()
                }
            }
        },
        //上面的异步化版本
        cpdir: new function(){
            function copyFile(file, newFile, after ){
                fs.stat(file, function(err, stat){//拷贝快捷方式与文件
                    if (stat.isSymbolicLink())
                        fs.readlink(file, function(err, link){
                            fs.symlink(link, newFile, after);
                        });
                    else
                        fs.readFile(file, function(err, data){
                            fs.writeFile(newFile, data, after);
                        });
                });
            }
            function copyFiles(files, old, neo, after){
                for(var i  = 0 , n = files.length, c = n; i < n ; i++){
                    var p = path.join( neo,  files[i].replace(old,"") )
                    copyFile(files[i], p, function(){
                        c--;
                        if(c == 0){
                            after()
                        }
                    })
                }
            }
            return function(old, neo, cb){//把当前目录里面的东西拷贝到新目录下（不存在就创建）
                cb = typeof cb == "function" ? cb : $.noop
                old = path.resolve(process.cwd(), old);
                neo = path.resolve(process.cwd(), neo);//允许拷贝到另一个分区中
                $.mkdir(neo, function(){
                    $.walk(old, function( files, dirs ){
                        var n = dirs.length
                        if( n ){//如果存在目录
                            for(var i  = 0 , c = n; i < n ; i++){
                                var p = path.join(neo,  dirs[i].replace(old,""))
                                $.mkdir(p, function(){
                                    c--
                                    if(c == 0){//目录拷贝完毕
                                        copyFiles(files, old, neo, cb)
                                    }
                                })
                            }
                        }else if(files.length){//如果不存在目录但存在文件
                            copyFiles(files, old, neo, cb)
                        }else{
                            cb()
                        };
                    });
                })
            }
        }

    })
});
// walk, delSync, del, mkdirSync, mkdir, writeFileSync, writeFile, cpdirSync, cpdir

//var cp = function(src, dst, callback) {//将一个文件的内容拷到另一个文件中，如果原来有东西，将被清掉再拷
//    var is = fs.createReadStream(src); //因此这方法只用于文件间的内容转移
//    var os = fs.createWriteStream(dst);//使用之前，要自己确保这两个文件是否存在
//    require("util").pump(is, os, callback);
//}
//var a = 4
//switch(a){
//    case 1 ://create
//        $.writeFile("files/45643/aara/test.js",'alert(88)', function(){
//            $.writeFile("files/45643/aaa.js", "alert(1)",function(){
//                console.log("创建文件与目录成功")
//            })
//        });
//        $.mkdir("aaerewr",function(){
//            console.log("创建目录成功")
//        });
//        break;
//    case 2 ://walk
//        $.walk("files",{
//            cb:function(files,dirs){
//                console.log(files);
//                console.log(dirs)
//                console.log("收集文件与目录，包括自身")
//            },
//            sync: true
//        })
//        break;
//    case 3: //delete
//        $.remove("files",function(files,dirs){
//            console.log("删除文件与目录，包括自身")
//        });
//        $.remove("aaerewr",function(files,dirs){
//            console.log("删除文件与目录，包括自身")
//        });
//        break;
//    case 4:
//        console.log( path.resolve(process.cwd(), "E:\\aaa.js") +"!" )
//        fs.writeFileSync("E:\\aaa.js","alert(1)");
//        cp("helpers.js","neer/ee.txt",function(){
//            console.log("ok")
//        })
//        $.cpdir("nbproject","E:\\neer");
//        break;
//}
//
//fs.rmdir("files/45643/aara/", function(){
//    console.log("dd")
//})
//
