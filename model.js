mass.define("",function(){
    return {
        schema  :{},    //用于定义存入数据库的字段的类型
        validates_numericality_of:"price",//用判定是否合法的数值
        validates_uniqueness_of:"name",
        validates_presence_of:"name",
        validate:[],//其他定义函数
        validates_format_of:{
            image_url:{
               "with":/\.(gif|jpg|png)$/i,
               msg:"XXXX"
            }
        },
        prototype:{}
    }
})

//如果数据库有一张名为orders的表,我们的程序就会有一个名为Order的类,表中的每条记录对应该类的一个实例，每条记录的字段会对应此实例的一个属性，
//另，此对象此拥有一些方法用来操作这些字段。

//控制器为视图提供数据，然后又接受来自页面的请来。