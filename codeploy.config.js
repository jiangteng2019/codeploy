/**
 * @host 服务器主机IP
 * @port 端口默认22
 * @username 服务器用户名
 * @privateKey ssh私钥地址
 * @password 服务器登录密码，不推荐使用
 * @passphrase 如果私钥进行了加密，passphrase 用于解密私钥
 * @localFolder 需要上传文件的目录路径 <相对路径>
 * @remoteFolder 服务器远端需要覆盖的目录, <绝对路径>
 */
const serverConfig = [
    {
        host: '120.48.134.120',
        port: 22,
        username: 'root',
        privateKey: '',
        password: '',
        passphrase: '',
        localFolder: 'dist',
        remoteFolder: '/root/test'
    },
    {
        host: '120.48.134.120',
        port: 22,
        username: 'root',
        privateKey: '',
        password: '',
        passphrase: '',
        localFolder: 'dist',
        remoteFolder: '/root/test1'
    }
]

module.exports = serverConfig;
