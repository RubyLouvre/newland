$.define("controller","mass/class",function(){
  //所有控制器的抽象类
    var opts = {}
    "index,new,create,show,edit,update,destroy".replace($.rword, function( action ){
        opts[ action ] = function(){
            $.log( "这是控制器基类的"+ action+ " action")
        }
    })
    var klass = $.factory(opts);
    $.base_controller = klass;
});