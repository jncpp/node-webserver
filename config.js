var LOG4JS = require("log4js");

Config = {};

Config.database = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "0827",
    database: "node_web"
};



Config.game_server = {
    host: "192.168.1.90",
    port: 6900
};

Config.logConfig = {
    appenders: [
        {                                       // 需要控制台打印
            type: "console"
        },
        {                                       // normal 记录器
            type: "file",                       // 日志文件类型，可以使用日期作为文件名的占位符
            filename: "./log/log.log",
            category: "normal"
        },
        {                                       // Web记录器
            type: "dateFile",                   // 日志文件类型，可以使用日期作为文件名的占位符
            filename: "./log/",
            pattern: "web-yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            category: "web"
        }
    ],
    levels: {                                   // 设置日志级别，低于该级别的将不会被打印到控制台
        normal: "trace",
        web: "trace"
    }
};
LOG4JS.configure(Config.logConfig);

exports.Config = Config;
exports.Logger = {
    Normal: LOG4JS.getLogger("normal"),
    Web: LOG4JS.getLogger("web")
};
