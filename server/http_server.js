var HTTP = require("http");
var HTTPS = require("https");
var UTIL = require("util");
var URL  = require("url");
var QUERY_STRING = require("querystring");
var EVENT_EMITTER = require("events").EventEmitter;
var BUFFER = require("buffer").Buffer;
var SOCKET = require("net").Socket;

var LOGGER = require("./../config.js").Logger.Normal;

function HttpServer() {}

// 继承自EventEmitter的原型
UTIL.inherits(HttpServer, EVENT_EMITTER);

exports.HttpServer = HttpServer;

HttpServer.prototype._callback = {};

/**
 * 创建Http服务器
 * @param {Number|Array} port
 */
HttpServer.prototype.createServer = function(port)
{
    var self = this;    // 在外部获取HttpServer本身this
    // 因为若是在内部createServer的参数中使用this,将是指的参数本身
    // this始终指调用函数的对象,这里的createServer由HttpServer

    // 创建http服务
    var server = HTTP.createServer(function(request, response) {
        // request 请求对象 response 响应对象
        request.setEncoding("utf8");
        var req_data = URL.parse(request.url, true);
        var callback = self._callback[req_data.pathname];
        if(callback){
            LOGGER.debug("[%s] request:[%s] path:[%s]", request.socket.remoteAddress, callback.name, req_data.pathname);
            callback.cb(request, response);
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

/**
 * 注册请求路径回调函数
 * @param {Object} arr
 * @example
 *  register([
 *      {name: "IREADER_LOGIN", path: "/", cb: function(){}},
 *      {name: "IREADER_LOGIN", path: "/login", cb: function(){}},
 *  ]);
 */
HttpServer.prototype.register = function(arr){
    if(!UTIL.isArray(arr)){
        LOGGER.error("register request callback error.");
    }else{
        var self = this;
        for(var i in arr){
            if(typeof arr[i] !== "object" || !arr[i].name || !arr[i].path || !arr[i].cb){
                LOGGER.warn("register request callback warn: %s", arr[i]);
                continue;
            }
            if(self._callback[arr[i].path]){
                LOGGER.warn("register request callback already exists [%s]", url_path);
            }
            self._callback[arr[i].path] = {
                "name": arr[i].name,
                "cb": arr[i].cb
            };
        }
    }
};

