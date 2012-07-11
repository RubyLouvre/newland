mass.define("endError","fs",function(fs){
    var status = {
        '304':  'Not Modified',
        '400':  'Bad Request',
        '401':  'Unauthorized',
        '402':  'Payment Required',
        '403':  'Forbidden',
        '404':  'Not Found',
        '405':  'Method Not Allowed',
        '406':  'Not Acceptable',
        '407':  'Proxy Authentication Required',
        '408':  'Request Timeout',
        '409':  'Conflict',
        '410':  'Gone',
        '411':  'Length Required',
        '412':  'Precondition Failed',
        '413':  'Request Entity Too Large',
        '414':  'Request-URI Too Long',
        '415':  'Unsupported Media Type',
        '416':  'Requested Range Not Satisfiable',
        '417':  'Expectation Failed',
        '421':  'There are too many connections from your internet address',
        '422':  'Unprocessable Entity',
        '424':  'Failed Dependency',
        '425':  'Unordered Collection',
        '426':  'Upgrade Required',
        '449':  'Retry With',
        '500':  'Internal Server Error',
        '501':  'Not Implemented',
        '502':  'Bad Gateway',
        '503':  'Service Unavailable',
        '504':  'Gateway Timeout',
        '505':  'HTTP Version Not Supported',
        '506':  'Variant Also Negotiate',
        '507':  'Insufficient Storage',
        '509':  'Bandwidth Limit Exceeded',
        '510':  'Not Extended'
    };
    return function(err, req, res){
        if(typeof err === "number"){
            var code  = err;
            err = {
                statusCode :code,
                message:status[code]
            }
        }else{
            err.statusCode = err.statusCode || 500;
        }
        var accept = req.headers.accept || '';
        if (~accept.indexOf('html')) {
            res.writeHead(err.statusCode, mass.mix(req.headers,{
                "Content-Type": "text/html"
            }));
            var html = fs.readFileSync(mass.adjustPath("public/error.html"))
            var msg =  msg = err.stack || err.message || String(err);
            msg = msg.replace(/\n/g, '<br/>');
            msg = "<h2>"+err.statusCode+" Error</h2>"
            res.write((html+"").replace("{{yield}}",msg));
            res.end();
        } else if (~accept.indexOf('json')) {//json
            var json = JSON.stringify(err);
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        // plain text
        } else {
            res.writeHead(res.statusCode, mass.mix(req.headers,{
                'Content-Type': 'text/plain'
            }));
            res.end(err.stack);
        }
    }
})