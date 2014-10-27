#!/usr/bin/env node

var HttpServer = require("./http_server.js").HttpServer;

var httpServer = new HttpServer();

httpServer.createServer(8080);
