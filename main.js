#!/usr/bin/env node
'use strict';

var HttpServer = require("./server/http_server.js").HttpServer;

var httpServer = new HttpServer();
httpServer.createServer(8080);

require("./platform/ireader.js").open(httpServer);


var Manager = require("./server/gm_manager.js").Manager;

var man = new Manager({
    beginTime: 0/*,
     endTime: 1401787820*/
});

man.autoSendMail("15:27:45", Date.constant.MS_HOURS, "879498884@qq.com");

//var mailOptions = {
//    to: "jncpp@qq.com",                     // 接收，可逗号分隔或数组[]表示多个收件者
//    subject: "Helloadwaw",                       // 主题
//    text: "Hello Worlddawdawdaw",                    // 文本内容
//    html: "<b>Hello World2</b>",            // html内容
//    attachments: [                          // 附件
//        {
//            filename: "main.js",                  // 附件名
//            path: "./main.js"                     // 本地或网络url路径，"http://www.baidu.com"
//        },
//        {
//            filename: "text.txt",
//            content: "嘿,哈,是谁送你来到我身边"   // string, buffer, stream等内容
//        }
//    ]
//};
//
//require("./server/mailer.js").sendEmail(mailOptions, function(err, info){
//    console.log(err, JSON.stringify(info));
//});
