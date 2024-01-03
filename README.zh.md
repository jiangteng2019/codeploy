# codeploy

快速部署应用到服务器

[中文](https://github.com/jiangteng2019/codeploy/blob/master/README.zh.md) |
[English](https://github.com/jiangteng2019/codeploy/blob/master/README.md)

## 描述
codeploy 使用 ssh2 快速部署前端打包文件到服务器。为了正确工作，你需要配置服务器的登录信息。

## 安装
```bash
npm install codeploy --save-dev
```

## 配置
codeploy 从项目根目录下的 package.json 的 codeploy 字段或 codeploy.config.js 读取配置。你的配置应包括以下字段：
```javascript
/**
* @host 服务器主机 IP
* @port 端口 默认 22
* @username 服务器用户名
* @privateKey ssh 私钥地址
* @password 服务器登录密码，不推荐使用
* @passphrase 如果私钥被加密，passphrase 用于解密私钥
* @localFolder 上传文件的目录路径 <相对路径>
* @remoteFolder 覆盖服务器的目录，<绝对路径>
*/
{
  host: '',
  port: 22,
  username: 'root',
  privateKey: '',
  password: '',
  passphrase: '',
  localFolder: 'dist',
  remoteFolder: '/root/test'
}
```
不推荐配置密码字段，但如果你这样做，请至少将 codeploy.config.js 添加到 .gitignore 中。推荐使用密钥登录。privateKey 字段应为你的私钥文件路径。如果未指定 privateKey 字段，它将从用户目录下的 .ssh/id_rsa 读取私钥。

## 运行
配置一个 npm 脚本以便使用
```json
"scripts": {
  "codeploy": "codeploy"
}
```
```shell
# 现在你可以运行
npm run codeploy
```