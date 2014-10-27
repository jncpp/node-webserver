var SSH = require("ssh2");
var UTIL = require("util");

var config = {
    local: {
        syncPath: "E:/Client_Resource/svn/",
        ignore: {
            dir: [".svn"],
            file: ["local.json"]
        }
    },
    remote: {
        ssh: {
            host: "118.192.72.105",
            port: 22,
            username: "root",
            password: "ssdld20140711"
        },
        syncPath: "/home/ddc/web/resource/harry_res/res/1.0.5/"
    }
};

/**
 * Check Config
 */
(function(){
    if(config.remote.syncPath[config.remote.syncPath.length-1] != "/"){
        config.remote.syncPath += "/";
    }
    if(!config.remote.ssh.port){
        config.remote.ssh.port = 22;
    }
})();

var sshClient = new SSH();

/**
 * 执行命令
 * @param {SSH} ssh
 * @param {String|Array} cmd
 * @param {Function} cb
 */
var exec = function(ssh, cmd, cb){
    ssh.exec(cmd, function(err, stream){
        if(err){
            cb(err);
        }else{
            var content = "";
            stream.on("exit", function(code, signal){
                if(code != 0){
                    console.log(UTIL.format("[L] ssh exec[%s]: exit. code:%d, signal:%s", cmd, code, signal));
                }
            }).on("close", function(){
                if(content[content.length-1] == '\n'){
                    content = content.slice(0, -1);
                }
                cb(null, content);
            }).on("data", function(data){
                content += data;
            }).stderr.on('data', function(data) {
                cb(new Error(data));
            });
        }
    });
};

var in_array = function(value, array){
    var b = false;
    for(var i in array){
        if(value == array[i]){
            b = true;
            break;
        }
    }
    return b;
};

/**
 * 获取文件md5
 * @param {SSH} ssh
 * @param {String} filename
 * @param {Function} cb
 */
var md5sum = function(ssh, filename, cb){
    if(filename[0] != "/"){
        filename = config.remote.syncPath + filename;
    }
    exec(ssh, "md5sum "+filename+" | awk '{print $1}'", function(err, content){
        if(err){
            cb(err, filename);
        }else{
            cb(null, filename, content);
        }
    });
};

/**
 * 获取远端的文件信息
 * @param {SSH} ssh
 * @param {SFTP} sftp
 * @param {Function} cb
 */
var get_remote_file_info = function(ssh, sftp, cb){
    var retry_record = {};
    var retry = function(filename){
        md5sum(ssh, filename, function(err, path, md5){
            retry_record.path = retry_record.path == undefined ? 0 : retry_record.path;
            if(err){
                if(retry_record.path < 20000) {
                    ++retry_record.path;
                    retry(path);
                }else{
                    cb(err, path);
                }
            }else{
                if(md5.length == 0){
                    retry(path);
                }else{
                    cb(null, path, md5);
                }
            }
        });
    };
    var get = function(path){
        sftp.readdir(path, function(err, lst){
            if(err){
                cb(err, path);
            }else{
                for(var i in lst){
                    var realpath = path + "/" + lst[i].filename;
                    realpath = realpath.replace(/[ ]/g, "\\ ");
                    var patharray = realpath.split("/");
                    var pathname = patharray[patharray.length-1];
                    if(lst[i].longname[0] == 'd'){
                        if(!in_array(pathname, config.local.ignore.dir)){
                            get(realpath);
                        }
                    }else{
                        if(!in_array(pathname, config.local.ignore.file)){
                            md5sum(ssh, realpath, function(err2, filename, md5){
                                if(err2){
                                    retry(filename);
                                }else{
                                    if(md5.length == 0){
                                        retry(path);
                                    }else{
                                        cb(null, path, md5);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
    };
    var remote_path = config.remote.syncPath;
    // 递归中需注意闭包错误,不要在子回调函数中使用上层的变量
    if(remote_path[remote_path.length-1] == '/'){
        remote_path = remote_path.slice(0, -1);
    }
    get(remote_path);
};

sshClient.on("ready", function(){
    console.info("[L] ssh connection: ready.");

    md5sum(sshClient, "/home/ddc/web/resource/harry_res/res/1.0.5/data/PartnerEnhance.dat", function(err2, filename, md5){
        if(err2){
            console.error(err2, filename);
        }else{
            console.log(null, filename, md5);
        }
    });

    sshClient.sftp(function(err, sftp){
        if(err){
            console.error("[E] ",err.message);
        }else{
//            sftp.fastGet("/root/install.log", "./install.log", function (err) {
//                if(err) console.error("[E] fastGet:", err.message);
//            });
            sftp.fastPut(config.local.syncPath + "server.json", config.remote.syncPath + "server.json", function (err) {
                if(err) console.error("[E] fastGet:", err.message); else{
                    console.log("[L]: sftp.fastPut successed.");
                }
            });
            get_remote_file_info(sshClient, sftp, function(err2, path, md5){
                if(err2){
                    console.error(UTIL.format("[E] get [%s] md5: error. %s", path, err2.message));
                }else{
                    console.log("[L]: ", path, md5);
                }
            });

        }
    })
}).on("error", function(err){
    console.error("[E] ssh connection: error: ", err);
});

sshClient.connect(config.remote.ssh);