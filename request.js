mass.define("request",function(){
    return {
        isModified : function(req, res, headers) {
            var headers = headers || res._headers || {}
            , modifiedSince = req.headers['if-modified-since']
            , lastModified = headers['last-modified']
            , noneMatch = req.headers['if-none-match']
            , etag = headers['etag'];

            if (noneMatch) noneMatch = noneMatch.split(/ *, */);

            // check If-None-Match
            if (noneMatch && etag && ~noneMatch.indexOf(etag)) {
                return false;
            }

            // check If-Modified-Since
            if (modifiedSince && lastModified) {
                modifiedSince = new Date(modifiedSince);
                lastModified = new Date(lastModified);
                // Ignore invalid dates
                if (!isNaN(modifiedSince.getTime())) {
                    if (lastModified <= modifiedSince) return false;
                }
            }
  
            return true;
        },
        removeContentHeaders : function(res){
            Object.keys(res._headers).forEach(function(field){
                if (0 == field.indexOf('content')) {
                    res.removeHeader(field);
                }
            });
        },
        /**
         * Return an ETag in the form of `"<size>-<mtime>"`
         * from the given `stat`.
         *
         * @param {Object} stat
         * @return {String}
         * @api private
         */

        etag : function(stat) {
            return '"' + stat.size + '-' + Number(stat.mtime) + '"';
        },

        /**
         * Parse "Range" header `str` relative to the given file `size`.
         *
         * @param {Number} size
         * @param {String} str
         * @return {Array}
         * @api private
         */

        parseRange : function(size, str){
            var valid = true;
            var arr = str.substr(6).split(',').map(function(range){
                var range = range.split('-')
                , start = parseInt(range[0], 10)
                , end = parseInt(range[1], 10);

                // -500
                if (isNaN(start)) {
                    start = size - end;
                    end = size - 1;
                    // 500-
                } else if (isNaN(end)) {
                    end = size - 1;
                }

                // Invalid
                if (isNaN(start) || isNaN(end) || start > end) valid = false;

                return { start: start, end: end };
            });
            return valid ? arr : undefined;
        },

        /**
         * Parse the given Cache-Control `str`.
         *
         * @param {String} str
         * @return {Object}
         * @api private
         */

        parseCacheControl : function(str){
            var directives = str.split(',')
            , obj = {};

            for(var i = 0, len = directives.length; i < len; i++) {
                var parts = directives[i].split('=')
                , key = parts.shift().trim()
                , val = parseInt(parts.shift(), 10);

                obj[key] = isNaN(val) ? true : val;
            }

            return obj;
        }
    }
})


