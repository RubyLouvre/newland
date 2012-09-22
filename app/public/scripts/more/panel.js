define("panel",["$node","$event","$css"], function(){
    $.ui = $.ui || {};

    $.ui.Panel = $.factory({
        init: function(opts){

            var html = '<div class="panel_wrap"><div class="panel_header"><div class="panel_title"></div><span class="panel_closer"></span></div><div class="panel_body"></div></div>'
            var parent = opts.parent || "body";
            var ui = $(html).appendTo(parent);

            ui.find(".panel_title").html( opts.title || "");
            ui.find(".panel_body").html( opts.body || "");

            ui.width( opts.width || 400 );
            ui.height( opts.height || 200 );
            ui.css( opts.css || {} );
            //closer为布尔
            if(opts.closer == false){
                ui.find(".panel_closer").hide();
            }
        }
    });

})

define('panel',[
	'$node',
	'$event',
	'$css',
	'$flow',
	'./ejs'
], function(){
	$.ui = $.ui||{}
	 var defaults = {
	 	showHead	: true,
	 	showFoot	: true,
	 	closeAble 	: true,
	 	parent		: 'body',
	 	content 	: {
		 	title 		: 'title',
		 	body  		: 'body',
		 	foot  		: ''
	 	},
	 	css 		: {
	 		width		: 400,
	 		height		: 200
	 	}
	 };
	$.ui.Panel = $.factory({
        inherit: $.Flow,
        init: function(opts) {
        	this.setOptions ("data", defaults, opts )
        	var self = this;
        	self.template = $.ejs.compile(
	            '<div class="panel_wrap">\
	                <% if( data.showHead ){ %>\
		                <div class="panel_header">\
		                    <div class="panel_title">\
		                    	<%= data.content.title %>\
		                    </div>\
		                    <% if( data.closeAble ){ %>\
		                    <span class="panel_closer"></span>\
		                    <% } %>\
		                </div>\
	                <% } %>\
	                <div class="panel_body">\
	                	<%= data.content.body %>\
	                </div>\
	                <% if( data.showFoot ){ %>\
		                <div class="panel_foot">\
		                	<%= data.content.foot %>\
		                </div>\
	                <% } %>\
	            </div>');
           	self.show();
        },
        show : function() {
            this.fire ( 'beforeshow' )
            this.ui && this.ui.remove();
        	this.ui = $(this.template( this.data ))
            	.appendTo( this.parent )
            	.css     ( this.css    )
            	.show    ();
            this.fire ( 'show' )
        },
        hide : function() {
        	this.ui && this.ui.hide().remove();
        	this.ui = undefined;
            this.fire ( 'hide' );
        },
        set : function( keyChain, val ) {
		    var keys = keyChain.split('.');
		    var key;
		    var ret = this;
		    while( keys.length > 1){
		    	key = keys.shift();
		    	ret[key] = ret[key] != undefined ? 
		    			   ret[key] :
		    			   {};
		    	ret = ret[key];
		    }
		    ret[keys.shift()] = val;
		    this.show();
		    return this;
		}
    });
})

