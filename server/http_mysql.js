'use strict';

var UTIL = require("util");
var CONFIG = require("./../config.js").Config;
var LOGGER = require("./../config.js").Logger.Mysql;
var MYSQL = require("mysql");   // api: https://github.com/felixge/node-mysql
// 对mysql模块，node.js的版本不能低于0.8，否则可能出现connect ECONNREFUSED的错误

/**
 * Mysql自封装类
 * @param {Object} config
 * @constructor
 */
function Mysql(){
    this.config = {};
    this.pool  = MYSQL.createPool(CONFIG.database.logdb);
}
exports.Mysql = Mysql;

/**
 * 设置数据库统计的起始和结束时间
 * @param {Number} beginTime
 * @param {Number} endTime
 */
Mysql.prototype.setTime = function(beginTime, endTime){
    this.config.beginTime = beginTime || 0;
    this.config.endTime = endTime;
};

/**
 * 基础查询函数
 * @param {String}              sql
 * @param {Object|Array|String} values
 * @param {Function}            cb      cb(err, result)
 */
Mysql.prototype.Query = function(sql, values, cb){
    var self = this;
    self.pool.getConnection(function(err, connection){
        var query = MYSQL.createQuery(sql, values, cb);
        if(err){
            console.error("get mysql pool connection error: %s", err.message);
        }else{
            query.once("end", function () {
                connection.release();
            });
            connection.query(query);
        }
    });
};


Mysql.prototype.Query_User = function(value, cb){
    var date = new Date();
    var str = UTIL.format("[%s-%s-%s %s:%s:%s] query user:\n%s\n\n",
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
        UTIL.inspect(value));
    LOGGER.info(str);
    var sql = UTIL.format("call query_user(?)");
    Query(sql, value, function(err, result, info){
        if(err){
            cb(err);
            console.error("query user error:", err);
        }else{
            // 2.4.3的版本将查询信息另作为了一个参数
            cb(null, result, info);
        }
    });
};

/**
 * 获取日志记录函数
 * @param {Function}        cb   cb(err, result, info)
 */
Mysql.prototype.getLogRecord = function(tablename, cb){
    var self = this;
    var str = "select * from " + tablename + " %s order by time;";
    var where = "where time >= " + (self.config.beginTime || 0);
    if(self.config.endTime){
        where += (" and time <= " + self.config.endTime);
    }
    var sql = UTIL.format(str, where);
    //LOGGER.trace(sql);
    self.Query(sql, {}, function(err, result, info){
        // 2.4.3的版本将查询信息另作为了一个参数
        if(err) LOGGER.error(__filename + " [getOnlineRecord] [" + tablename + "]: ", err.message);
        cb(err, result, info);
    });
};