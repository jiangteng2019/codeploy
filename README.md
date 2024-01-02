# codeploy

## description

codeploy Use ssh 2 to quickly deploy the front-end packaged files to the server. In order to work correctly, you need to configure the login information for the server.

## install

```
npm install codeploy --save-dev
```

## configure
codeploy read configuration from the codeploy field of package.json or from codeploy.config.js at the root of the project.

Your configuration should include the following fields:

```javascript
/**
* @ Host server host IP
* @port port default 22
* @username Server user name
* @privateKey ssh Private key address
* @password Server login password, it is not recommended
* @passphrase If the private key is encrypted, passphrase is used to decrypt the private key
* @localFolder Directory path for upload file <Relative path>
* @remoteFolder Directory to override the server, <Absolute Path>
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

It is not recommended that you configure password fields, but if you do, make sure you add codeploy.config.js to. gitignore at least.

Login with a secret key is recommended. The privateKey field should be the file path of your private key. if privateKey field not specified, it will read the privateKey from .ssh/id_rsa under user directory.

## run
```
codeploy
```

Or you can configure an npm script

    "scripts": {
        "deploy": "codeploy"
    }

```shell
# now you can run 
npm run deploy
```


