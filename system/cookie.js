$.define("cookie","crypto", function(crypto){
    var encode = encodeURIComponent;
    var decode = decodeURIComponent;
    // serialize('foo', 'bar', { httpOnly: true })  => "foo=bar; httpOnly"
    //将两个字符串变成一个cookie字段
    var serialize = function(name, val, opts){
        var pairs = [name + '=' + encode(val)];
        if( isFinite( opts ) && $.type( opts, "Number" ) ){
            pairs.push('Max-Age=' + opts );
        }else{
            opts = opts || {};
            if( opts.secret ){//添加加密支持
                var timestamp = Date.now();
                var hmac_sig = getHmac(true, timestamp, val);
                var data = hmac_sig + timestamp + val;
                if( data > 4096 ){
                    throw  new Error('data too long to store in a cookie');
                }
                pairs = [name + '=' + encode(data)];
            }
            if (opts.maxAge) pairs.push('Max-Age=' + opts.maxAge);
            if (opts.domain) pairs.push('Domain=' + opts.domain);
            if (opts.path) pairs.push('Path=' + opts.path);
            if (opts.expires) pairs.push('Expires=' + opts.expires.toUTCString());
            if (opts.httpOnly) pairs.push('HttpOnly');
            if (opts.secure) pairs.push('Secure');
        } 
        return pairs.join('; ');
    };
    //将一段字符串变成对象
    var parse = function(str) {
        var obj = {}
        var pairs = str.split(/[;,] */);
        pairs.forEach(function(pair) {
            var eq_idx = pair.indexOf('=')
            var key = pair.substr(0, eq_idx).trim()
            var val = pair.substr(++eq_idx, pair.length).trim();
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }
            if (undefined == obj[key]) {
                obj[key] = decode(val);
            }
        });
        return obj;
    };

    //使用 高级加密标准AES-192进行加密
    var encrypt = function(secret, str){
        var cipher = crypto.createCipher("aes192", secret);
        return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
    }
    //使用 高级加密标准AES-192进行解密
    var decrypt = function(secret, str){//解密aes192
        var decipher = crypto.createDecipher("aes192", secret);
        return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
    }
    var getHmac = function(secret, timestamp, data){
        // Generates a HMAC for the timestamped data, returning the
        // hex digest for the signature.
        var hmac = crypto.createHmac('sha1', secret);
        hmac.update(timestamp + data);
        return hmac.digest('hex');
    };
    // Splits a cookie string into hmac signature, timestamp and data blob.
    var splitHmac = function(str){
        return {
            hmac_signature: str.slice(0,40),
            timestamp: parseInt(str.slice(40, 53), 10),
            data_blob: str.slice(53)
        };
    }
    var validHmac = function(secret, timeout, str){
        // Tests the validity of a cookie string. Returns true if the HMAC
        // signature of the secret, timestamp and data blob matches the HMAC in the
        // cookie string, and the cookie's age is less than the timeout value.
        var parts = splitHmac(str);
        var hmac_sig = getHmac( secret, parts.timestamp, parts.data_blob  );
        return  parts.hmac_signature === hmac_sig && parts.timestamp + timeout > Date.now()
    }

    var deserialize = function(secret, timeout, str){//解密
        // Parses a secure cookie string, returning the object stored within it.
        // Throws an exception if the secure cookie string does not validate.
        if(!validHmac(secret, timeout, str)){
            return null
        }
        var data = decrypt(secret, splitHmac(str).data_blob);
        return JSON.parse(data);
    };

    return {
        deserialize: deserialize,
        encrypt: encrypt,
        decrypt: decrypt,
        splitHmac: splitHmac,
        validHmac: validHmac,
        parse: parse,
        serialize: serialize
    }

})
//2012.8.19  全新cookie工具类,添加大量加密解密函数