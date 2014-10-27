var UTIL = require("util");
var CONFIG = require("./config.js").Config;
var LOGGER = require("./config.js").Logger.Mysql;
var MYSQL = require("mysql");   // api: https://github.com/felixge/node-mysql
// 对mysql模块，node.js的版本不能低于0.8，否则可能出现connect ECONNREFUSED的错误

var pool = MYSQL.createPool(CONFIG.database);

var Return_Code = {
    REGISTER_SUCCESS:      "600",
    REGISTER_PARAM_ERROR:  "601",
    REGISTER_ID_EXISTS:    "602",
    REGISTER_UNKNOW_ERROR: "603",

    RESETPWD_SUCCESS:      "700",
    RESETPWD_PARAM_EROR:   "701",
    RESETPWD_UNKNOW_ERROR: "702",
    RESETPWD_ID_NOTEXISTS: "703",
    RESETPWD_PHONE_ERROR:  "704"
};

var Query = function(sql, values, cb){
    pool.getConnection(function(err, connection){
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

var Insert_Charge = function(table, value){
    var date = new Date();
    var str = UTIL.format("[%s-%s-%s %s:%s:%s] insert charge %s:\n%s\n\n",
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
        table, UTIL.inspect(value));
    LOGGER.info(str);
    var sql = UTIL.format("insert into %s set ?", table);
    Query(sql, value, function(err, result){
        if(err){
            console.error("insert charge %s error: %s", table, err.message);
            if(err.code == "ER_DUP_ENTRY"){
                // cpp参数键重复，即一条消息发送了多次
                LOGGER.error("insert charge is repeated. cp:", value.cpparam);
            }
            return;
        }
    });
};

var Insert_User = function(value, cb){
    var date = new Date();
    var str = UTIL.format("[%s-%s-%s %s:%s:%s] insert user:\n%s\n\n",
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
        UTIL.inspect(value));
    LOGGER.info(str);
    var sql = UTIL.format("call insert_user(?, ?, ?, ?, ?)");
    Query(sql, value, function(err, result){
        if(err){
            cb(err);
            if(err.code != "ER_DUP_ENTRY"){
                // 不是主键username重复的情况
                console.error("insert user error:", err);
            }
        }else{
            cb(null, result);
        }
    });
};

var Reset_Passwd = function(value, cb){
    var date = new Date();
    var str = UTIL.format("[%s-%s-%s %s:%s:%s] reset passwd:\n%s\n\n",
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
        UTIL.inspect(value));
    LOGGER.info(str);
    var sql = UTIL.format("call reset_passwd(?, ?, ?)");
    Query(sql, value, function(err, result){
        if(err){
            cb(err);
            console.error("insert user error:", err);
        }else{
            cb(null, result);
        }
    });
};

var Query_User = function(value, cb){
    var date = new Date();
    var str = UTIL.format("[%s-%s-%s %s:%s:%s] query user:\n%s\n\n",
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
        UTIL.inspect(value));
    LOGGER.info(str);
    var sql = UTIL.format("call query_user(?)");
    Query(sql, value, function(err, result){
        if(err){
            cb(err);
            console.error("query user error:", err);
        }else{
            cb(null, result);
            // 对于查询，result[0]是所有查询结果的数组，result[1]才是查询信息
            // 其他诸如增删改的result都是一个查询信息对象
            // TODO: 至少2.4.0版本如此, 2.4.3则是将查询信息单独作为一个参数(err, result, info)
        }
    });
};

exports.Query = Query;
exports.InsertCharge = Insert_Charge;
exports.InsertUser   = Insert_User;
exports.QueryUser    = Query_User;
exports.ResetPasswd  = Reset_Passwd;
exports.ReturnCode   = Return_Code;