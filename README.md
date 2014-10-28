node-webserver
=========

һ��ʹ��[node.js]д��web������������������

ʹ��ʾ��:
---------
* ��װ��Ӧ�⣺
```sh
npm install -d
```
* ����
```sh
node main.js
```

Ŀ¼�ṹ����:
---------

##### platform
* ��Ը�ƽ̨�Ľ���
> * **ireader.js** ����iReaderƽ̨����

##### server
* ���ַ���������
> * **http_server.js** http������
> * **http_mysql.js**  mysql������

##### common.js 
* һЩ���ߺ���

##### config.js
* �����ļ�

##### main.js
* ��������ļ�

�Զ���ƽ̨����
---------

```sh
// ireader.js
var request_callback = [
    {
        name: "IREADER_LOGIN",
        path: "/login",
        cb: function(req, resp){
            // TODO: ��½����
        }
    },
    {
        name: "IREADER_CHARGE",
        path: "/pay",
        cb: function(req, resp){
            // TODO: ��ֵ����
        }
    }
];

exports.open = function(httpServer){
    httpServer.register(request_callback);
};
```

```sh
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