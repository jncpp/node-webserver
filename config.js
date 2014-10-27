var LOG4JS = require("log4js");

Config = {};

Config.database = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "0827",
    database: "node_web"
};

Config.app_id = '8906ef2a9167195a70e2';

Config.private_key = '-----BEGIN RSA PRIVATE KEY-----' + "\n" +
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
    '-----END RSA PRIVATE KEY-----';

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
