var CRYPTO = require("crypto");
var HTTP = require("http");
var HTTPS = require("https");
var QUERY_STRING = require("querystring");
var CONFIG = require("./config.js").Config;

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

var sign = function(private_key, obj){
    var keys = Object.keys(obj),
        i,
        str = "",
        ret = {},
        length = keys.length;
    // 字典排序，类似php的ksort
    keys = keys.sort();
    for(i = 0; i < length; ++i){
        str += (keys[i] + "=" + obj[keys[i]]);
        if(i != length - 1){
            str += "&";
        }
    }
    // 创建
    var sign = CRYPTO.createSign('RSA-SHA1');
    sign.update(str);
    return sign.sign(private_key, 'base64');
};

exports.token_check = function(opt, cb){
    var param = {
        app_id: Config.app_id,
        open_uid: opt.open_uid,
        access_token: opt.access_token,
        timestamp: Date.now(),
        sign_type: "RSA",
        version: "1.0"
    };
    param.sign = sign(CONFIG.private_key, param);
    var options = {
        hostname:  'uc.zhangyue.com'
    };
    if(opt.is_post){
        options.path = '/open/token/check';
        options.mothod = 'POST';
    }else{
        options.path = '/open/token/check/?' + QUERY_STRING.stringify(param);
    }
    var req = HTTPS.request(options, function(res){
        res.setEncoding("utf8");
        var body = "";
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function(){
            cb(null, body);
        });
        res.on("error", function(err){
            cb(err);
        });
    });
    req.on("error", function(err){
        cb(err);
    });
    if(opt.is_post){
        req.write(QUERY_STRING.stringify(param));
    }
    req.end();
};