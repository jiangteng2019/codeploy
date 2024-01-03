#!/usr/bin/env node

'use strict';

var require$$2 = require('path');
var require$$0 = require('fs');
var require$$1 = require('archiver');
var require$$1$1 = require('os');
var require$$3 = require('ssh2');
require('process');

var src = {};

const fs$1 = require$$0;
const archiver = require$$1;
const path$2 = require$$2;

// 压缩文件夹
function compressFiles$1(folderPath) {
    try {
        if (!folderPath) throw new Error("The folder must be specified");
        // 目录不存在
        if (!fs$1.existsSync(folderPath)) throw new Error("The compressed folder does not exist");
        // 文件名默认在脚本执行目录也就是项目根目录文件夹下
        const compressedFileName = 'app-dist-' + Date.now() + '.zip';
        // 创建写入流
        const output = fs$1.createWriteStream(compressedFileName);
        // 压缩对象
        const archive = archiver('zip', {
            // 设置压缩级别
            zlib: { level: 9 }
        });
        output.on('close', function () {
            console.log(`Archive created: ${folderPath} (${archive.pointer()} total bytes)`);
        });
        archive.pipe(output);
        archive.directory(folderPath, false);
        archive.finalize();
        return compressedFileName;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

// 解压远程文件夹
function decompressServerFile$1(connection, remoteFilePath, remoteFolder) {
    return new Promise((resolve, reject) => {
        const command = `unzip -o ${remoteFilePath} -d ${remoteFolder}`;
        connection.exec(command, (err, stream) => {
            if (err) throw err;

            stream.on('close', (code, signal) => {
                console.log(`Stream closed with code: ${code}, signal: ${signal}`);
                if (code === 0) {
                    console.log("decompress success");
                    resolve();
                } else {
                    reject();
                }
            });

            stream.on('data', (data) => {
                console.log('    STDOUT: ' + data);
            });

            stream.stderr.on('data', (data) => {
                console.error('STDERR: ' + data);
            });
        });
    })

}

// 上传文件
// 必须指定为远端服务器的文件名，只写文件夹会报错
function uploadFile$1(connection, localFilePath, remoteFilePath) {
    return new Promise((resolve, reject) => {
        connection.sftp((err, sftp) => {
            if (err) reject(err);
            sftp.fastPut(localFilePath, remoteFilePath, {}, (error) => {
                if (error) reject(error);
                console.log('upload success');
                resolve();
            });
        });
    })
}

// 读取配置文件
function readConfig() {
    const packageJsonPath = path$2.join(process.cwd(), 'package.json');
    const codeployConfigPath = path$2.join(process.cwd(), 'codeploy.config.js');
    let codeployConfig = null;

    // 尝试从package.json读取配置
    try {
        let config = require(packageJsonPath)['codeploy'];
        if (config) {
            codeployConfig = config;
            return codeployConfig;
        }
    } catch (error) {
        console.error('Unable to load codeploy config', error);
    }

    // 尝试从codeploy.config.js读取配置
    try {
        codeployConfig = require(codeployConfigPath);
        return codeployConfig;
    } catch (error) {
        console.error('Unable to load codeploy config', error);
    }

    return false;
}

function validateFields(configObj) {
    const requiredFields = ["host", "port", "username", "localFolder", "remoteFolder"];
    requiredFields.forEach(field => {
        if (!(field in configObj)) {
            throw new Error(`${field} field required`);
        }
    });
    const o = ["privateKey", "password", "passphrase"];
    if (!(o[0] in configObj) && !(o[1] in configObj) && !(o[2] in configObj)) {
        throw new Error("Please provide a log in credentials")
    }
    return true;
}

function loadConfig$1() {
    const config = readConfig();
    if (Object.prototype.toString.call(config) === '[object Object]') {
        if (validateFields(config)) {
            // 将拼接成绝对路径
            config.localFolder = path$2.join(process.cwd(), config.localFolder);
            return [config];
        }
    }
    if (Array.isArray(config)) {
        // 校验不通过会抛出错误
        config.forEach(item => validateFields(item));
        return config.map(item => ({ ...item, localFolder: path$2.join(process.cwd(), item.localFolder) }))
    }
}

// 清理本地压缩文件
function clearLocalFile$1(localFilePath) {
    if (fs$1.existsSync(localFilePath)) {
        fs$1.rmSync(localFilePath);
        console.log('clean local file success');
    } else {
        console.log("File does not exist");
    }
}

// 清理远程压缩文件
function clearRemoteFile$1(connection, remoteFilePath) {
    return new Promise((resolve, reject) => {
        const command = `rm -f ${remoteFilePath}`;
        connection.exec(command, (err, stream) => {
            if (err) throw err;

            stream.on('close', (code, signal) => {
                console.log(`Stream closed with code: ${code}, signal: ${signal}`);
                if (code === 0) {
                    console.log("clean remote file success");
                    resolve();
                } else {
                    reject();
                }
                connection.end();
            });
            stream.on('data', (data) => {
                console.log('STDOUT: ' + data);
            });
            stream.stderr.on('data', (data) => {
                console.error('STDERR: ' + data);
            });
        });
    })
}



var main = { loadConfig: loadConfig$1, compressFiles: compressFiles$1, uploadFile: uploadFile$1, decompressServerFile: decompressServerFile$1, clearLocalFile: clearLocalFile$1, clearRemoteFile: clearRemoteFile$1 };

const fs = require$$0;
const os = require$$1$1;
const path$1 = require$$2;

const { Client } = require$$3;

// 获取用户主目录的路径
const homeDirectory = os.homedir();

// 构建 id_rsa 文件的完整路径
const privateKeyPath = path$1.join(homeDirectory, '.ssh', 'id_rsa');

// ssh2客户端
const conn = new Client();

function logInWithSSH$1(codeployConfig) {
    return new Promise((resolve, reject) => {
        const { host, port, username, password, privateKey, passphrase } = codeployConfig;

        conn.connect({
            host: host,
            port: port || 22,
            username: username || 'root',
            password: password,
            privateKey: privateKey || fs.readFileSync(privateKeyPath),
            passphrase: passphrase
        });

        conn.on('ready', () => {
            console.log('Client :: ready');
            resolve(conn);
        });

        conn.on('error', (err) => {
            console.error(`Connection error: ${err}`);
            reject(err);
        });
    });

}

var ssh2 = { logInWithSSH: logInWithSSH$1 };

const path = require$$2;
const { loadConfig, compressFiles, uploadFile, decompressServerFile, clearLocalFile, clearRemoteFile } = main;
const { logInWithSSH } = ssh2;

const codeployConfig = loadConfig();


async function work(codeployConfig) {
    try {
        // 获取远端服务器配置
        const { localFolder, remoteFolder } = codeployConfig;
        // ssh连接
        const connection = await logInWithSSH(codeployConfig);
        // 压缩文件夹获取文件名
        const fileName = compressFiles(localFolder);
        // 本地压缩包路径
        const localFilePath = path.join(process.cwd(), fileName);
        // 远程服务器路径
        const remoteFilePath = `${remoteFolder}/${fileName}`;
        // 上传压缩文件
        await uploadFile(connection, localFilePath, remoteFilePath);
        // 解压服务器文件
        await decompressServerFile(connection, remoteFilePath, remoteFolder);
        // 清理本地压缩文件
        clearLocalFile(localFilePath);
        // 清理远程压缩文件
        await clearRemoteFile(connection, remoteFilePath);
        // log
        console.log(`upload files to ${codeployConfig.host} ${remoteFolder} success`);

    } catch (error) {
        console.log(error);
        console.log("Execution failed");
    }
}

async function start() {
    for (let i = 0; i < codeployConfig.length; i++) {
        await work(codeployConfig[i]);
    }
}

start();

module.exports = src;
