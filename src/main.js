const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// 压缩文件夹
function compressFiles(folderPath) {
    try {
        if (!folderPath) throw new Error("The folder must be specified");
        // 目录不存在
        if (!fs.existsSync(folderPath)) throw new Error("The compressed folder does not exist");
        // 文件名默认在脚本执行目录也就是项目根目录文件夹下
        const compressedFileName = 'app-dist-' + Date.now() + '.zip';
        // 创建写入流
        const output = fs.createWriteStream(compressedFileName);
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
function decompressServerFile(connection, remoteFilePath, remoteFolder) {
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
            })

            stream.on('data', (data) => {
                console.log('    STDOUT: ' + data);
            })

            stream.stderr.on('data', (data) => {
                console.error('STDERR: ' + data);
            });
        });
    })

}

// 上传文件
// 必须指定为远端服务器的文件名，只写文件夹会报错
function uploadFile(connection, localFilePath, remoteFilePath) {
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
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const codeployConfigPath = path.join(process.cwd(), 'codeploy.config.js');
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

function loadConfig() {
    const config = readConfig();
    if (Object.prototype.toString.call(config) === '[object Object]') {
        if (validateFields(config)) {
            // 将拼接成绝对路径
            config.localFolder = path.join(process.cwd(), config.localFolder);
            return [config];
        }
    }
    if (Array.isArray(config)) {
        // 校验不通过会抛出错误
        config.forEach(item => validateFields(item));
        return config.map(item => ({ ...item, localFolder: path.join(process.cwd(), item.localFolder) }))
    }
}

// 清理本地压缩文件
function clearLocalFile(localFilePath) {
    if (fs.existsSync(localFilePath)) {
        fs.rmSync(localFilePath);
        console.log('clean local file success');
    } else {
        console.log("File does not exist")
    }
}

// 清理远程压缩文件
function clearRemoteFile(connection, remoteFilePath) {
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
            })
            stream.on('data', (data) => {
                console.log('STDOUT: ' + data);
            })
            stream.stderr.on('data', (data) => {
                console.error('STDERR: ' + data);
            });
        });
    })
}



module.exports = { loadConfig, compressFiles, uploadFile, decompressServerFile, clearLocalFile, clearRemoteFile }