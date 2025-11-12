# Node.js 项目自动化部署指南

本文档详细说明了如何配置 Node.js 项目的自动化部署流程，使用 Git 钩子和 PM2 实现一键部署。

## 环境要求

- 本地开发环境：Node.js v24+, npm 11+
- 服务器环境：Node.js, PM2, Git
- 项目已使用 Git 管理

## 配置步骤

### 1. 本地配置

#### 1.1 安装 PM2
```bash
npm install -g pm2
```

#### 1.2 创建 PM2 配置文件
已在项目根目录创建 `ecosystem.config.js` 文件，内容如下：

```javascript
module.exports = {
  apps: [{
    name: 'jiyibi',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }],

  deploy: {
    production: {
      user: 'your-server-username',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/path/to/your/app',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
```

### 2. 服务器配置

#### 2.1 创建裸仓库
在服务器上执行以下命令：

```bash
mkdir /path/to/your/app/repo.git
cd /path/to/your/app/repo.git
git init --bare
```

#### 2.2 创建 Git 钩子
创建 `hooks/post-receive` 文件：

```bash
nano hooks/post-receive
```

添加以下内容：

```bash
#!/bin/bash
REPO_PATH="/path/to/your/app/repo.git"
PROD_PATH="/path/to/your/app"

git --work-tree=$PROD_PATH --git-dir=$REPO_PATH checkout -f

cd $PROD_PATH
npm install
npx pm2 reload ecosystem.config.js --env production
```

#### 2.3 设置钩子权限
```bash
chmod +x hooks/post-receive
```

### 3. 配置说明

在本地的 `ecosystem.config.js` 文件中，需要将以下占位符替换为实际值：

- `your-server-username`: 服务器用户名
- `your-server-ip`: 服务器 IP 地址
- `your-git-repo-url`: Git 仓库地址
- `/path/to/your/app`: 服务器上的项目路径

### 4. 部署命令

#### 4.1 初始化部署环境
```bash
npx pm2 deploy ecosystem.config.js production setup
```

#### 4.2 部署代码
```bash
npx pm2 deploy ecosystem.config.js production
```

## 工作流程

1. 在本地完成代码开发和测试
2. 提交代码到 Git 仓库
3. 运行部署命令 `npx pm2 deploy ecosystem.config.js production`
4. PM2 会自动将代码推送到服务器，并执行安装依赖和重启应用的操作

## 注意事项

1. 确保服务器上已安装 Node.js 和 PM2
2. 确保服务器上的项目路径有正确的读写权限
3. 如果使用私有 Git 仓库，需要配置 SSH 密钥
4. 部署过程中如果有错误，可以通过 PM2 日志进行排查

## 故障排除

1. 检查服务器上的 Git 钩子是否正确配置
2. 确认 PM2 配置文件中的路径和参数是否正确
3. 查看 PM2 日志文件获取错误信息