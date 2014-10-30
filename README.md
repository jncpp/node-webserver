node-webserver
=========

一个使用[node.js]写的web服务器，将不断完善

使用示例:
---------
* 安装对应库：
```sh
npm install -d
```
* 运行
```sh
node main.js
```

目录结构解析:
---------

##### platform
* 针对各平台的接入

> * **ireader.js** 掌阅iReader平台接入

##### server
* 各种服务器驱动

> * **http_server.js** http服务器
> * **http_mysql.js**  mysql服务器

##### common.js 
* 一些工具函数

##### config.js
* 配置文件

##### main.js
* 程序入口文件

自定义平台接入
---------

```js
// ireader.js
var request_callback = [
    {
        name: "IREADER_LOGIN",
        path: "/login",
        cb: function(req, resp){
            // TODO: 登陆操作
        }
    },
    {
        name: "IREADER_CHARGE",
        path: "/pay",
        cb: function(req, resp){
            // TODO: 充值操作
        }
    }
];

exports.open = function(httpServer){
    httpServer.register(request_callback);
};
```

```js
// main.js
var HttpServer = require("./server/http_server.js").HttpServer;

var httpServer = new HttpServer();
httpServer.createServer(8080);

require("./platform/ireader.js").open(httpServer);
```

License
---------

MIT


**Free Software, Hell Yeah!**

[node.js]:http://nodejs.org