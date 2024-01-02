
const path = require('path');
const { loadConfig, compressFiles, uploadFile, decompressServerFile, clearLocalFile, clearRemoteFile } = require('./main');
const { logInWithSSH } = require('./ssh2');
const { config } = require('process');

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
        const remoteFilePath = `${remoteFolder}/${fileName}`
        // 上传压缩文件
        await uploadFile(connection, localFilePath, remoteFilePath);
        // 解压服务器文件
        await decompressServerFile(connection, remoteFilePath, remoteFolder);
        // 清理本地压缩文件
        clearLocalFile(localFilePath);
        // 清理远程压缩文件
        await clearRemoteFile(connection, remoteFilePath);
        // log
        console.log(`upload files to ${codeployConfig.host} ${remoteFolder} success`)

    } catch (error) {
        console.log(error);
        console.log("Execution failed")
    }
}

async function start() {
    for (let i = 0; i < codeployConfig.length; i++) {
        await work(codeployConfig[i]);
    }
}

start();












