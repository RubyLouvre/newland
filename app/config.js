define( function(){
    // 虽然说“约定优于配置”，但也不能没配置。不过如果只要配置配置就能搞定，总比写代码好多了。 
    return $.config = {
        services: [],
        http_method: "_method",//用于模拟PUT,DELETE方法
        environments: "development",
        port: 8888,
        write_page: true,
        third_modules: "spec,random,menu,tab",//你可以用字符串形式表示，也可以用数组形式表示
        timeout: 4000,
        maxObjects: 128,
        maxLength: 1024 * 256,
        maxAge: 60*60*24*365,
        logfile: $.path.join( process.cwd(),"/log/master.log"),
        //默认session配置,必需加载get_cookie服务，否则无效
        session: {
            type: "cookie",//可选值有mongo, cookie, memory
            sid:   "mass_sid",//sessionID
            table: "sessions",//这个type=mongo时，决定存放在哪个集合中
            life: 60 * 10 //生命周期，单位ms 实验用,减少为10分种,
        },
        cookie: {
            path: "/",
            life:60 * 10// 实验用,减少为10分种,其实至少要两星期  14 * 24 * 60 * 60
        },
        db: {
            name: "mongodb",   //数据库的名字
            host:  "localhost",//连接数据库时用
            port:  27017       //连接数据库时用
        }
    }
})