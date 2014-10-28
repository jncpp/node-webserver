var QUERY_STRING = require("querystring");
var HTTP = require("http");
var HTTPS = require("https");
var URL = require('url');

var ksort = function(obj){
    var keys = Object.keys(obj),
        i,
        ret = {};
    keys = keys.sort();
    for(i = 0; i < keys.length; ++i){
        ret[keys[i]] = obj[keys[i]];
    }
    return ret;
};

/**
 *
 * @param {Object|String} opt
 * @param {Function} cb
 */
exports.request = function(opt, cb){
    var req_opt = {};
    var req_param = {};
    if((typeof opt === "string" || (typeof opt === "object" && opt.url)) && typeof cb === "function"){
        if(typeof opt === "string"){
            req_opt = URL.parse(opt);
        }else{
            req_param = opt.param;
            if(opt.method === "GET" && typeof req_param === "object"){
                opt.url = opt.url + "/?" + QUERY_STRING.stringify(req_param);
            }
            req_opt = URL.parse(opt.url);
            var keys = Object.keys(opt);
            var i = keys.length;
            while (i--) {
                if(keys[i] !== "url" && keys[i] !== "param")
                    req_opt[keys[i]] = opt[keys[i]];
            }
        }
    }else{
        throw new Error('Params error.');
    }
    var times = 0;
    var _http = req_opt.protocol === "https:" ? HTTPS : HTTP;
    var req = _http.request(req_opt, function(res){
        res.setEncoding("utf8");
        var body = "";
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function(){
            cb(null, body, Date.now() - times);
        });
        res.on("error", function(err){
            cb(err);
        });
    });
    req.on("error", function(err){
        cb(err);
    });
    if(req_opt.method === "POST" && Object.keys(req_param).length > 0){
        req.write(QUERY_STRING.stringify(req_param));
    }
    req.end();
    times = Date.now();
};

//// 连接gameserver
//self.socket = new SOCKET();
//self.socket.setEncoding("binary");
//self.socket.connect(CONFIG.game_server.port,CONFIG.game_server.host, function(){
//    LOGGER.info("connect socket successed");
//});
//self.socket.on('data',function(data){
//    LOGGER.trace('recv data:'+ data);
//});
//self.socket.on('error',function(err){
//    LOGGER.error('gameserver socket error: '+ err);
//    self.socket.destroy();
//});
//self.socket.on('close', function() {
//    LOGGER.info('socket connection closed');
//});