var HTTP = require("http");
var HTTPS = require("https");
var UTIL = require("util");
var URL  = require("url");
var QUERY_STRING = require("querystring");
var EVENT_EMITTER = require("events").EventEmitter;
var BUFFER = require("buffer").Buffer;
var SOCKET = require("net").Socket;

var COMMON = require("./common.js");
var CONFIG = require("./config.js").Config;
var LOGGER = require("./config.js").Logger.Web;

function HttpServer() {}

UTIL.inherits(HttpServer, EVENT_EMITTER);        // 继承自EventEmitter的原型

exports.HttpServer = HttpServer;

HttpServer.prototype.createServer = function(port)
{
    var self = this;    // 在外部获取HttpServer本身this
    // 因为若是在内部createServer的参数中使用this,将是指的参数本身
    // this始终指调用函数的对象,这里的createServer由HttpServer

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//    // 连接gameserver
//    self.socket = new SOCKET();
//    self.socket.setEncoding("binary");
//    self.socket.connect(CONFIG.game_server.port,CONFIG.game_server.host, function(){
//        LOGGER.info("connect socket successed");
//    });
//    self.socket.on('data',function(data){
//        LOGGER.trace('recv data:'+ data);
//    });
//    self.socket.on('error',function(err){
//        LOGGER.error('gameserver socket error: '+ err);
//        self.socket.destroy();
//    });
//    self.socket.on('close', function() {
//        LOGGER.info('socket connection closed');
//    });

    // 创建http服务
    var server = HTTP.createServer(function(request, response) {
        // request 请求对象 response 响应对象
        request.setEncoding("utf8");
        var req_data = URL.parse(request.url, true);
        switch(req_data.pathname){
            case "/":
                LOGGER.debug("emit request_main_page ", self.emit("request_main_page", req_data, response));
                break;
            default:
                break;
        }
    }).listen(port);

    server.on("error", function(){
        LOGGER.error(UTIL.format("Listen port error at [%d].", port));
        process.exit(1);
    });

    server.on("listening", function(){
        LOGGER.info("Http server running at http://127.0.0.1:%d/", port);
    });
};

HttpServer.prototype.on("request_main_page", function(req_data, response){
    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    COMMON.token_check({
        open_uid: "019628eb42c69638f903f8c6c73521da",
        access_token: "229bb134a3ed9bf271c056363b692ad9",
        is_post: false
    }, function(err, content) {
        if(err){
            LOGGER.error("ERROR: ", err.message);
            response.end(err.message);
        }else{
            var obj = JSON.parse(content);  // 会将\u转换成中文
            LOGGER.trace("BODY: ", obj);
            response.end(JSON.stringify(obj));
        }
    })
});
