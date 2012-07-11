
mass.define("hot_deploy","fs,child_process",function(fs,Child){

    
    return function(obj){
        //取得某一目录下的所有文件
        function getAllFiles(root) {
            var result = [], files = fs.readdirSync(root);
            files.forEach(function(file) {
                var pathname = root+ "/" + file,
                stat = fs.lstatSync(pathname);
                if (stat === undefined) return
                // 不是文件夹就是文件
                if (!stat.isDirectory()) {
                    result.push(pathname)
                // 递归自身
                } else {
                    result = result.concat(getAllFiles(pathname))
                }
            })

            return result
        }

        //重启线程
        function rebootProcess(exec,args){
            args = args || []
            var child = exports.child = Child.spawn(exec, args);//创建一个新线程来接力
            child.stdout.addListener("data", function (chunk) {
                chunk && console.log(chunk);
            });
            child.stderr.addListener("data", function (chunk) {
                chunk && console.log(chunk);
            });
            child.addListener("exit", function () {
                console.log("reboot process...");
                rebootProcess(exec, args);
            });
        }
        //结束线程
        function crashProcess (prev, cur) {
            if ( cur && +cur.mtime !== +prev.mtime|| crashProcess.status ) return;
            crashProcess.status = 1;//如果经过调整，则重止线程
            var child = exports.child;
            console.log("crash process...");
            setTimeout(function() {
                process.kill(child.pid);
                crashProcess.status = 0;
            }, 50);
        }
        crashProcess.status = 0;
        var dirs = obj.dirs;
        var exts = obj.exts;
        dirs = ["./jslouvre"]
        console.log("==============================")
        var rexts = new RegExp("^.*\.(" + exts.join("|") + ")$"), files = [];
        //收集符合给定后缀后的文件
        dirs.forEach(function(dir){
            files = files.concat( getAllFiles(dir))
        });

        //开始监听
        rebootProcess("node",[]);
        //监听给定的文件
        function watchGivenFile (watch, time) {
            fs.watchFile(watch, {
                persistent: true,
                interval: time
            }, crashProcess);
        }
        files.forEach(function(file){
            if(rexts.test(file)){
                console.log("///////////////////")
                watchGivenFile(file,50)
            }
        });
    }
});

//https://github.com/joyent/node/pull/2049
//https://github.com/joyent/node/issues/2093
//https://github.com/jashkenas/coffee-script/pull/1846
//https://github.com/DracoBlue/spludo/blob/master/build/run_dev_server.js
//http://stackoverflow.com/questions/4681067/how-to-deploy-node-js