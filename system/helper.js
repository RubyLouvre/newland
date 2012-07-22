$.define("helper","class", function(){
    Helper = $.factory({
        init: function(){
            this.links = []
            this.scripts = []
            this.set_layout = function(){}
            this.set_title =  function(){}
        },
        set_layout: function( str ){
            this.layout = str
        },
        set_title: function( str ){
            this.title = str
        },
        add_css : function (file) {
            var args = Array.apply([],arguments);
            var opts = {
                media: 'screen',
                rel: 'stylesheet',
                type: 'text/css'
            };
            if (typeof args[args.length - 1] == 'object') {
                opts = $.mix( opts, args.pop(), false);
            }
            var href = checkFile('css', file);
            delete opts.href;
            this.links.push( genericTagSelfclosing('link', opts, {
                href: href
            }));
        },
        add_js: function( file ){
            var args = Array.apply([],arguments);
            var opts = {
                type: 'text/javascript'
            };
            if (typeof args[args.length - 1] == 'object') {
                opts = $.mix( opts, args.pop(), false);
            }
            var href = checkFile('js', file);
            delete opts.src;
            this.scripts.push( genericTag('script', '', opts, {
                src: href
            }));
        }
    })

    function checkProd() {
        return $.configs.env === 'production';
    }
    var regexps = {
        'cached': /^cache\//,
        'isHttp': /^https?:\/\/|\/\//
    },
    exts = {
        'css': '.css',
        'js' : '.js'
    },
    paths = {
        'css': '/stylesheets/',
        'js' : '/javascripts/'
    };
    function checkFile(type, file) {
        var isExternalFile = regexps.isHttp.test(file),
        isCached         = file.match(regexps.cached),
        href             = !isExternalFile ? paths[type] + file + exts[type] : file,
        isProd           = checkProd();
        if (!isCached && !isProd && !isExternalFile ) {
            href += '?' + Date.now()
        }
        return href;
    }
    function genericTag(name, inner, params, override) {
        return '<' + name + htmlTagParams(params, override) + '>' + inner + '</' + name + '>';
    }

    function genericTagSelfclosing(name, params, override) {
        return '<' + name + htmlTagParams(params, override) + ' />';
    }
    
    function htmlTagParams(params, override) {
        var maybe_params = '';
        $.mix(params, override, false);
        for (var key in params) {
            if (params[key] != void 0) {
                maybe_params += ' ' + key + '="' + params[key].toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"';
            }
        }
        return maybe_params;
    };
    return Helper
})



