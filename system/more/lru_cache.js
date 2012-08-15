//http://cnodejs.org/topic/50210100f767cc9a51de4f3a
//author: Sun, Junyi (weibo.com/treapdb)
//usage: node --nouse-idle-notification --expose-gc --max-old-space-size=8192 memcached.js

var config ={
  port: 11211,
  max_memory: 100 // default 100M bytes
}

var net = require('net');
var LRU = function (max) { // this LRU implementaion is based on https://github.com/chriso/lru
    this.cache = {}
    this.head = this.tail = null;
    this.length = 0;
    this.max = max || config.max_memory << 20;
    setInterval(function(lru_store){
        evict_count = parseInt(lru_store.length/3)
        for(i=0;i<evict_count;i++){
          if(process.memoryUsage().rss > lru_store.max)
            lru_store.evict()
          else
            break;
        }
        console.log("element count:", lru_store.length)

    },2000,this)  // detection of LRU eviction every 2 seconds
};

LRU.prototype.remove = function (key) {
  var element = this.cache[key];
  if(element) {
    delete this.cache[key];
    this.length --;
    if(element.prev) this.cache[element.prev].next = element.next;
    if(element.next) this.cache[element.next].prev = element.prev;
    if(this.head == key) {
      this.head = element.prev;
    }
    if(this.tail == key) {
      this.tail = element.next;
    }
  }
  return element;
}

LRU.prototype.set = function (key, value) {
    element = this.remove(key);
    element = element || { value:value };

    element.next = null;
    element.prev = this.head;
    element.value = value;

    this.cache[key] = element;

    if (this.head) {
        this.cache[this.head].next = key;
    }
    this.head = key;

    if(!this.tail) {
      this.tail = key;
    }
    this.length ++
    if(process.memoryUsage().rss > this.max){
        this.evict()
    }
};

LRU.prototype.get = function (key) {
    var element = this.cache[key];
    if (!element) { return; }

    this.set(key, element.value);
    return element.value;
};

LRU.prototype.evict = function () {
    if(!this.tail) { return; }
    var key = this.tail;
    var element = this.remove(this.tail);
};

var store = new LRU()


function handle_header(header,crlf_len){
    var tup = header.split(" ")
    var expect_body_len = 0
    switch(tup[0]){
        case 'get':
        case 'delete':
            expect_body_len = 0
            break
        case 'set':
            expect_body_len = parseInt(tup[4]) + crlf_len
            break
        case 'gc': // this command is used for maintain
            expect_body_len = 0
            gc()
            break;
    }
    return expect_body_len
}

function handle_body(socket,header,body,call_back){
    var response=""
    var tup = header.split(" ")
    switch(tup[0]){
        case 'get':
            var key = tup[1]
            var obj = store.get(key)
            if(obj){
                response = "VALUE "+ key+" " + obj.flag+" "  + obj.data.length + "\r\n"
                response += obj.data + "\r\n"
                response += "END\r\n"
            }
            else
                response = "NOT_FOUND\r\n"
            break;
        case 'delete':
            var key = tup[1]
            store.remove(key)
            response = "DELETED\r\n"
            break;
        case 'set':
            var key = tup[1]
            var obj = {flag: tup[2], expire:0 , data: body}
            store.set( key , obj)
            response = "STORED\r\n"
            break;
        case 'gc': // this command is used for maintain
            response = "OK\r\n"
            break;
        default:
            response = "ERROR\r\n"
            break;
    }
    socket.write(response,"binary",call_back)
}

var server = net.createServer(function (socket) {
    console.log("client: ",socket.remoteAddress)
    var user_state = 'reading_header'
    var buf = ""
    var header =""
    var body = ""
    var expect_body_len = 0
    var CRLF_LEN = 2
    socket.setEncoding("binary")
     socket.on('data',function(data){
         buf += data
         socket.emit('user_event') // we may got some data to handle
     })
     socket.on('user_event',function(){
         switch(user_state){
             case "reading_header": //if we are reading header
                 var pos =-1
                if((pos=buf.indexOf('\r\n'))!=-1){
                    header = buf.slice(0,pos)
                    buf = buf.slice(pos+2)
                    CRLF_LEN =2
                }
                else if((pos=buf.indexOf('\n'))!=-1){
                    header = buf.slice(0,pos)
                    buf = buf.slice(pos+1)
                    CRLF_LEN =1
                }
                if(pos!=-1){
                    user_state = 'reading_body'
                    expect_body_len = handle_header(header,CRLF_LEN)
                    socket.emit("user_event")
                }
                 break
             case "reading_body":  // if we are reading body
                 if(expect_body_len <= buf.length){
                     body = buf.slice(0,expect_body_len-CRLF_LEN)
                     buf = buf.slice(expect_body_len)
                     user_state = 'reading_header'
                     handle_body(socket,header,body,
                         function(){
                             if(buf.length>0)
                                 socket.emit("user_event")
                         }
                     )

                 }
                 break
         }
     })
});

console.log("listening at "+ config.port)
console.log("max memory: " + config.max_memory + "M bytes")
server.listen(config.port, '0.0.0.0')

setInterval(function(){gc(); console.log(process.memoryUsage());},5000) // manually garbage collection every 5 seconds