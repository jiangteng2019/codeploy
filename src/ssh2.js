const fs = require('fs');
const os = require('os');
const path = require('path');

const { Client } = require('ssh2');

// 获取用户主目录的路径
const homeDirectory = os.homedir();

// 构建 id_rsa 文件的完整路径
const privateKeyPath = path.join(homeDirectory, '.ssh', 'id_rsa');

// ssh2客户端
const conn = new Client();

function logInWithSSH(codeployConfig) {
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
        })

        conn.on('error', (err) => {
            console.error(`Connection error: ${err}`);
            reject(err);
        });
    });

}

module.exports = { logInWithSSH }


