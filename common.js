'use strict';

var QUERY_STRING = require("querystring");
var HTTP = require("http");
var HTTPS = require("https");
var URL = require('url');
var UTIL = require('util');

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
 * 请求
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


/**
 * 并行的执行多个任务
 * @param {Array}    arr        一个数组，每个元素将作为参数传入到iterator中
 * @param {Function} iterator   function(element, cb)执行批量操作的函数，函数内部执行任务操作，每一个任务成功调用cb(),不成功调用cb(err)
 * @param {Function} callback   function(err)，err为空表示全部成功执行，被传入值表示某一个任务出错，由上面cb(err)传回
 * @example

 exports.each([1, 2, 3], function(ele, cb){
    if(ele == 4){
        cb(new Error());
    }else{
        cb();
    }
 }, function(err){
    if(err){
        // 某一步错误
        console.log(err);
    }else{
        // 全部成功
        console.log("done.");
    }
 });
 */
exports.each = function(arr, iterator, callback){
    callback = callback || function() {};
    if(!arr.length){
        return callback();
    }
    var index = 0;
    arr.forEach(function(x){                // forEach是异步函数，即各Task之间将异步运行
        iterator(x, function(err){          // 这里可见iterator的回调函数只接受一个参数(err/null)
            if(err){
                callback(err);
                callback = function() {};   // 错误并结束后就不会再调用原本callback()，但不会影响其他task
            }else{
                if(++index >= arr.length){  // 正确并结束后调用callback(null)
                    callback(null);
                }
            }
        })
    });
};

/**
 * 串行的执行多个任务，某一个出错将不再继续执行
 * @param {Array} arr
 * @param {Function} iterator
 * @param {Function} callback
 */
exports.eachSeries = function(arr, iterator, callback){
    callback = callback || function() {};
    if(!arr.length){
        return callback();
    }
    var index = 0;
    var forEach = function(){                   // 这里一个个的执行task
        iterator(arr[index], function(err){     // 这里可见iterator的回调函数同样只接受一个参数(err/null)
            if(err){
                callback(err);
                callback = function() {};       // 错误并任务结束后就不会再调用原本的callback()，而且错误将不会继续执行后面的任务
            }else{
                if(++index >= arr.length){      // 正确并结束后调用callback(null)
                    callback(null);
                }else{
                    forEach();
                }
            }
        })
    };
    forEach();
};

/**
 * 将Date转换成格式化的字符串
 * @returns {String}
 */
Date.prototype.toFormatString = function () {
    var self = this;
    return UTIL.format("%d-%s-%s %s:%s:%s.%s",
        self.getFullYear(), Number(self.getMonth() + 1).toLenString(2), self.getDate().toLenString(2),
        self.getHours().toLenString(2), self.getMinutes().toLenString(2), self.getSeconds().toLenString(2),
        self.getMilliseconds().toLenString(3));
};

/**
 * 将Date的日期部分转换成格式化的字符串
 * @returns {String}
 */
Date.prototype.toFormatDateString = function () {
    var self = this;
    return UTIL.format("%d-%s-%s",
        self.getFullYear(), Number(self.getMonth() + 1).toLenString(2), self.getDate().toLenString(2));
};

/**
 * Date增加天数
 * @param {Number} num
 * @return {Date}
 */
Date.prototype.addDays = function (num) {
    var self = this;
    self.setTime(self.getTime() + num*24*60*60*1000);
    return self;
};

/**
 * 返回两个时间的天数差,arg1-arg2
 * @param {Date} date1
 * @param {Date} date2
 * @return {Number}
 */
Date.diffDays = function(date1, date2) {
    if(!UTIL.isDate(date1) || !UTIL.isDate(date2)){
        return 0;
    }else{
        // 向上取整,有小数部分加1
        return Math.ceil((date1.getTime() - date2.getTime()) / (24*60*60*1000));
    }
};

/**
 * 获取与时间相关的常量
 * @static
 * @return {Object}
 */
Date.constant = {
    MS_MINUTES: 1000*60,
    MS_HOURS:   1000*60*60,
    MS_DAY:     1000*60*60*24,
    S_MINUTES:  60,
    S_HOURS:    60*60,
    S_DAY:      60*60*24
};

/**
 * 将数字转换成指定长度的字符串,不足前面加0
 * @param {Number} len
 * @returns {String}
 */
Number.prototype.toLenString = function(len){
    var l = this.toString().length;
    if(len <= l){
        return this.toString();
    }else{
        var str = "";
        for(var i = l; i < len; ++i){
            str += "0";
        }
        str += this.toString();
        return str;
    }
};

/**
 * 求平均
 * @param {Array|Object} obj
 * @param {Number} defaultValue
 * @returns {Number}
 */
exports.avg = function(obj, defaultValue){
    var sum = 0;
    var len = 0;
    for(var i in obj){
        ++len;
        sum += obj[i];
    }
    return (len > 0) ? (sum / len) : defaultValue;
};

/**
 * 求和
 * @param {Array|Object} obj
 * @returns {Number}
 */
exports.sum = function(obj){
    var sum = 0;
    for(var i in obj){
        sum += obj[i];
    }
    return sum;
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