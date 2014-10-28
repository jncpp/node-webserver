#!/usr/bin/env node

var HttpServer = require("./server/http_server.js").HttpServer;

var httpServer = new HttpServer();
httpServer.createServer(8080);

require("./platform/ireader.js").open(httpServer);