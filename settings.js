$.define("settings", function(){
   
    return $.settings = {
        //栏截器"favicon",
        intercepters: ["mime","location","static","postData","methodOverride","json","render","matcher"],
        //你想建立的网站的名字（请修正这里）
        appname: "jslouvre",
        //在哪个目录下建立网站（请修正这里）
        approot: process.cwd(),
        http_method: "_method",//用于模拟PUT,DELETE方法
        environments: "development",
        port: 8888,
        maxObjects: 128,
        maxLength: 1024 * 256,
        maxAge: 60*60*24*365,
        db:{
            development:{
                driver:   "mongoose", 
                host:     "localhost", 
                database: "cms-dev"
            }, 
            test: {
                driver:   "mongoose" , 
                host:     "localhost", 
                database: "cms-test"
            } , 
            staging:{
                driver:   "mongoose", 
                host:     "localhost", 
                database: "cms-staging"
            }, 
            production:{
                driver:   "mongoose" , 
                host:     "localhost" , 
                database: "cms-production"
            }
        }
    }
});