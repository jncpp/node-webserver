var CRYPTO = require("crypto");
var LOGGER = require("./../config.js").Logger.Web;
var COMMON = require("./../common.js");

var platform_config = {
    url:{
        login_url: "https://uc.zhangyue.com/open/token/check"
    },
    app_id: '8906ef2a9167195a70e2',
    private_key: '-----BEGIN RSA PRIVATE KEY-----' + "\n" +
        'MIICXQIBAAKBgQDkfkbnCzeyuf1hh6RaVbPavoDLvomGgKYbnQruGqLmEy/Q7y8R' + "\n" +
        'JsPRuK9ygZy0ohdeyqy6uE29Pveflcze75TWbBoYUx0oplrVjhJojtHaclpZFaa9' + "\n" +
        'Fz5pQ/EjAwR5gYXnRPb4s6h7SUa4hUAieig5XEBsxE1ngShYAgEqUVlsKQIDAQAB' + "\n" +
        'AoGACV5AC/MCypojkF8eVvHSmPJcl33tZ41YwiMTMqX27dX1jOxxkpNzTeLzlo9H' + "\n" +
        '3IQUzzciE9nAnjS5tFpQ9wb9pCUcmSrdJWFX9PYDJJXMe7TqaYUZa1JPhirJR8Fe' + "\n" +
        '5m0rlCKaNsNU9np6lf3ajuKZaCj7pKb/2Bu79ZAizFTADy0CQQD6DYbmXFfRN9W3' + "\n" +
        'xUsrGgINLkx4olbAEiuCfeAhq1u1QmwX8IFrqa2vDXLKN0eRvKzuO51rcVI9/S1W' + "\n" +
        'ME2MGTLnAkEA6e17d8Zp4/ee8mWjcehKlxWF8W9yd0tyCAFbluCE+PJHbNNE7L/Y' + "\n" +
        'a+omiMXnFoEy1eK8nL4PxtSI4zsMQn+WbwJBAJ0uW5n6egk9u84k6rdRRfDbJZ6/' + "\n" +
        'DSD3Svpf/b+sY51w/1mdCP2QT2k2Xu3WCdsGav3l43JibXwh5ZnECzsBrAkCQCZ4' + "\n" +
        'keeez+dX3+IJaRngk/PI7GBKbc7Er5o1bvSfM/8lCS4SiLFO067bsT6pHVoMIWof' + "\n" +
        'gdldQIb4iRKlsVx2Uy0CQQDH07nH6ajiQwvIKBNzMCrJMJSxiM53O2apBMyT+2dv' + "\n" +
        'P82AEd75wZt0LjSl7cnsfURsPUybMBRg2/EayoET54+/' + "\n" +
        '-----END RSA PRIVATE KEY-----'
};

/**
 * 平台的一些启动所需的前置处理
 */
(function(){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
})();

var login_check = function(request, response){
    /**
     * 根据传入的请求参数返回RSA-SHA1私钥生成的签名
     * @param {Object} obj
     * @returns {String}
     */
    var sign = function(obj){
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
        return sign.sign(platform_config.private_key, 'base64');
    };

    /**
     * 响应
     * @param opt
     * @param cb
     */
    var token_check = function(opt, cb){
        // 请求的参数（查询参数或POST数据）
        var param = {
            app_id: platform_config.app_id,
            open_uid: opt.open_uid,
            access_token: opt.access_token,
            timestamp: Date.now(),
            sign_type: "RSA",
            version: "1.0"
        };
        param.sign = sign(param);
        COMMON.request({
            url: platform_config.url.login_url,
            method: opt.is_post ? "POST" : "GET",
            param: param
        }, cb);
    };

    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    token_check({
        open_uid: "019628eb42c69638f903f8c6c73521da",
        access_token: "229bb134a3ed9bf271c056363b692ad9",
        is_post: false
    }, function(err, content, time) {
        if(err){
            LOGGER.error("ERROR: ", err.message);
            response.end(err.message);
        }else{
            var obj = JSON.parse(content);  // 会将\u转换成中文
            LOGGER.trace("TIME: " + time + "ms BODY: ", obj);
            response.end(JSON.stringify(obj));
        }
    });
};

var request_callback = [
    {
        name: "IREADER_LOGIN",
        path: "/",
        cb: login_check
    }
];

exports.open = function(httpServer){
    httpServer.register(request_callback);
};